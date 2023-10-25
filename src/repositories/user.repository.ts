/* eslint-disable @typescript-eslint/no-unused-vars */
import { In, Repository } from 'typeorm';
import { AES, enc } from 'crypto-js';
import { InjectRepository } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { User } from 'src/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from 'src/dto/login.dto';
import { SearchUserDto } from 'src/dto/search-user.dto';
import { UpdateUserDto } from 'src/dto/update-user.dto';
import * as bcrypt from 'bcryptjs';
import { RoleRepository } from './role.repository';
import { Session } from 'src/entities/session.entity';
import { SessionRepository } from './session.repository';
import { RegisterDto } from 'src/dto/register.dto.ts';
import { PermissionRepository } from './permission.repository';

export class UserRepository extends Repository<User> {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(RoleRepository)
    public roleRepository: RoleRepository,
    @InjectRepository(PermissionRepository)
    public peramRepo: PermissionRepository,
    @InjectRepository(SessionRepository)
    public sessionRepository: SessionRepository,
    private jwtService: JwtService,
  ) {
    super(
      userRepository.target,
      userRepository.manager,
      userRepository.queryRunner,
    );
  }

  async getUsers(filterDto: SearchUserDto): Promise<User[]> {
    const { status, search } = filterDto;
    const query = this.userRepository.createQueryBuilder('user');

    if (status) {
      query.andWhere('user.status = :status', { status });
    }
    if (search) {
      query.andWhere('(user.name LIKE :search OR user.email LIKE :search)', {
        search: `%${search}%`,
      });
    }

    const products = await query
      .leftJoinAndSelect('user.role', 'role')
      .getMany();

    return products;
  }

  async register(registerDto: RegisterDto) {
    const { name, email, mobileNumber } = registerDto;

    // Check for existing user
    const oldUserByEmail = await this.userRepository.findOne({
      where: { email: email.toLowerCase() },
    });
    if (oldUserByEmail) {
      throw new NotFoundException({
        statusCode: 404,
        message: `User registered with ${email} email`,
      });
    }

    // Check for existing user by mobile number
    const oldUserByMobile = await this.userRepository.findOne({
      where: { mobileNumber },
    });
    if (oldUserByMobile) {
      throw new NotFoundException({
        statusCode: 404,
        message: `User registered with ${mobileNumber} mobile number`,
      });
    }

    // Get or create the default role
    let role = await this.roleRepository.findOne({ where: { name: 'admin' } });
    if (!role) {
      role = this.roleRepository.create({ name: 'admin' });
      await this.roleRepository.save(role);
    }

    // Create the new user
    const hashPassord = AES.encrypt(
      registerDto.password,
      process.env.ENCRYPTION_KEY,
    ).toString();
    const user = this.userRepository.create({
      name: name,
      email: email.toLowerCase(),
      password: hashPassord,
      mobileNumber: mobileNumber,
      roles: [role],
    });
    await this.userRepository.save(user);

    const { password, ...others } = user;
    return others;
  }

  async login(loginDto: LoginDto) {
    const { mobileNumber, password } = loginDto;

    // Find the user based on mobileNumber
    const user = await this.userRepository.findOne({
      where: [{ mobileNumber }],
      relations: ['roles', 'roles.permissions'],
    });

    if (!user) {
      throw new NotFoundException({
        statusCode: 404,
        message: `User not found with given credentials`,
      });
    }

    // Check password
    const decryptedPassword = AES.decrypt(
      user.password,
      process.env.ENCRYPTION_KEY,
    ).toString(enc.Utf8);
    if (decryptedPassword !== password) {
      throw new NotFoundException({
        statusCode: 404,
        message: `Incorrect password`,
      });
    }

    // Generate JWT token and create a session
    const tokenDetails = await this.generateToken(user);
    const session = this.createSession(tokenDetails, user);
    await this.sessionRepository.save(session);

    // Prepare the response
    const response = this.prepareLoginResponse(user, tokenDetails);

    return response;
  }

  async generateToken(user: User) {
    const payload = { sub: user.id, username: user.email };
    const token = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET,
    });
    const tokenString = AES.encrypt(
      token,
      process.env.ENCRYPTION_KEY_TOKEN,
    ).toString();

    return {
      token,
      tokenString,
    };
  }

  createSession(tokenDetails: any, user: User) {
    const expiryDate = new Date(Date.now() + 3600 * 1000); // 1 hour expiry

    const session = this.sessionRepository.create({
      token: tokenDetails.token,
      user: user,
      stringToken: tokenDetails.tokenString,
      expires_at: expiryDate,
      is_expired: false,
    });

    return session;
  }

  async prepareLoginResponse(user: User, tokenDetails: any) {
    const roles = user.roles.map((role) => role.name);

    const permissions = [
      ...new Set(
        user.roles.flatMap((role) =>
          role.permissions
            ? role.permissions.map((permission) => permission.name)
            : [],
        ),
      ),
    ];

    const allPermissions = await this.peramRepo.find();

    const { name, email, status } = user;

    return {
      data: {
        user: { name, email, status, permissions },
        permissions: allPermissions.map((p) => p.name),
        token: tokenDetails.tokenString,
      },
      statusCode: 200,
      message: 'Login Successful',
    };
  }

  async updateUser(userId: string, updateData: UpdateUserDto): Promise<User> {
    const userToUpdate = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles'],
    });

    if (!userToUpdate) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const { roleIds, password, ...otherUpdateFields } = updateData;

    // If roleIds are provided, update the roles of the user
    if (roleIds) {
      userToUpdate.roles = await this.roleRepository.find({
        where: {
          id: In(roleIds),
        },
      });
    }

    // If a new password is provided, hash it
    if (password) {
      userToUpdate.password = AES.encrypt(
        password,
        process.env.ENCRYPTION_KEY,
      ).toString();
    }

    // Merge any other update fields into the user entity
    this.userRepository.merge(userToUpdate, otherUpdateFields);

    await this.userRepository.save(userToUpdate);

    return userToUpdate;
  }
}
