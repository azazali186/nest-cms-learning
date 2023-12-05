/* eslint-disable @typescript-eslint/no-unused-vars */
import { In, Like, Repository } from 'typeorm';
import { AES, enc } from 'crypto-js';
import { InjectRepository } from '@nestjs/typeorm';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from 'src/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from 'src/dto/login.dto';
import { SearchUserDto } from 'src/dto/search-user.dto';
import { UpdateUserDto } from 'src/dto/update-user.dto';
import { RoleRepository } from './role.repository';
import { SessionRepository } from './session.repository';
import { RegisterDto } from 'src/dto/register.dto.ts';
import { PermissionRepository } from './permission.repository';
import { AdminPageRepository } from './admin-page.repository';
import { ApiResponse } from 'src/utils2/response.util';
import { CreateUserDto } from 'src/dto/create-user.dto';
import { LangService } from 'src/services/lang.service';
import { UserStatus } from 'src/enum/user-status.enum';
import { splitDateRange } from '../utils2/helper.utils';
import { ChangePasswordDto } from 'src/dto/change-password.dto';

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
    @InjectRepository(AdminPageRepository)
    public apRepo: AdminPageRepository,
    private jwtService: JwtService,
    private langService: LangService,
  ) {
    super(
      userRepository.target,
      userRepository.manager,
      userRepository.queryRunner,
    );
  }

  async findSessionToken(toke: string) {
    const token = await this.sessionRepository.findOne({
      where: {
        stringToken: toke,
      },
    });
    return token;
  }

  async getUsers(filterDto: SearchUserDto) {
    const { status, search, createdDate } = filterDto;
    const limit =
      filterDto.limit && !isNaN(filterDto.limit) && filterDto.limit > 0
        ? filterDto.limit
        : 10;
    const offset =
      filterDto.offset && !isNaN(filterDto.offset) && filterDto.offset >= 0
        ? filterDto.offset
        : 0;
    const query = this.userRepository.createQueryBuilder('user');

    if (status) {
      query.andWhere('user.status = :status', { status });
    }
    if (search) {
      query.andWhere(
        '(user.name LIKE :search OR user.username LIKE :search OR user.mobile_number LIKE :search)',
        {
          search: `%${search}%`,
        },
      );
    }
    if (createdDate) {
      const { startDate, endDate } = splitDateRange(createdDate);
      query.andWhere('(user.created_at BETWEEN :startDate AND :endDate)', {
        startDate: startDate,
        endDate: endDate,
      });
    }

    const [users, count] = await query
      .leftJoinAndSelect('user.roles', 'roles')
      .leftJoinAndSelect('user.updated_by', 'updated_by')
      .leftJoinAndSelect('user.created_by', 'created_by')
      .select([
        'user.id',
        'user.username',
        'user.name',
        'user.created_at',
        'user.updated_at',
        'user.status',
        'created_by.id',
        'created_by.username',
        'updated_by.id',
        'updated_by.username',
        'user.mobile_number',
        'roles.name',
      ])
      .skip(filterDto.offset)
      .take(filterDto.limit)
      .getManyAndCount();

    return ApiResponse(
      { list: users, count: count },
      200,
      this.langService.getTranslation('GET_DATA_SUCCESS', 'Users'),
    );
  }

  async register(registerDto: RegisterDto) {
    const { name, username } = registerDto;

    // Check for existing user
    const oldUserByEmail = await this.userRepository.findOne({
      where: { username: username },
    });
    if (oldUserByEmail) {
      throw new ConflictException({
        statusCode: 409,
        message: `USER_EXIST`,
        param: username,
      });
    }

    // Get or create the default role
    let role = await this.roleRepository.findOne({ where: { name: 'member' } });
    if (!role) {
      role = this.roleRepository.create({ name: 'member' });
      await this.roleRepository.save(role);
    }

    // Create the new user
    const hashPassord = AES.encrypt(
      registerDto.password,
      process.env.ENCRYPTION_KEY,
    ).toString();
    const user = this.userRepository.create({
      name: name,
      username: username,
      password: hashPassord,
      roles: role,
    });
    await this.userRepository.save(user);

    const { password, ...others } = user;
    return ApiResponse(
      others,
      201,
      this.langService.getTranslation('REGISTER_SUCCESS'),
    );
  }

  async login(loginDto: LoginDto) {
    const { username, password } = loginDto;

    // Find the user based on mobileNumber
    const user = await this.userRepository.findOne({
      where: [{ username }],
      relations: ['roles', 'roles.permissions'],
    });

    if (!user) {
      throw new NotFoundException({
        statusCode: 404,
        message: `WRONG_USERNAME`,
        param: username,
      });
    }
    if (user.status === UserStatus.INACTIVE) {
      throw new UnauthorizedException({
        statusCode: 401,
        message: 'DISABLED_ACCOUNT',
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
        message: 'WRONG_PASSWORD',
      });
    }
    // console.log('login User', user);

    // Generate JWT token and create a session
    const tokenDetails = await this.generateToken(user);
    const session = this.createSession(tokenDetails, user);
    await session;

    // Prepare the response
    const response = await this.prepareLoginResponse(user, tokenDetails);

    return response;
  }

  async generateToken(user: User) {
    const payload = { sub: user.id, username: user.username };
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

  async createSession(tokenDetails: any, user: User) {
    const expiryDate = new Date(Date.now() + 3600 * (1000 * 240)); // 10 Days

    if (process.env.SINGLE_USER_LOGIN) {
      await this.sessionRepository
        .createQueryBuilder('sessions')
        .delete()
        .where('userId = :userId', { userId: user.id })
        .execute();
    }

    const session = this.sessionRepository.create({
      token: tokenDetails.token,
      user: user,
      stringToken: tokenDetails.tokenString,
      expires_at: expiryDate,
      is_expired: false,
    });

    return this.sessionRepository.save(session);
  }

  async prepareLoginResponse(user: User, tokenDetails: any) {
    const { name, username, status } = user;

    return ApiResponse(
      {
        user: { name, username, status },
        // permissions: allPermissions.map((p) => p.name),
        token: tokenDetails.tokenString,
      },
      200,
      this.langService.getTranslation('LOGIN_SUCCESS'),
    );
  }

  async updateUser(userId: any, updateData: UpdateUserDto, user) {
    const userToUpdate = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!userToUpdate) {
      throw new NotFoundException({
        statusCode: 409,
        message: `INVALID_USER_ID`,
      });
    }

    const { roleId, password, name, username, mobileNumber, status } =
      updateData;

    // If roleIds are provided, update the roles of the user
    if (roleId) {
      userToUpdate.roles = await this.roleRepository.findOne({
        where: {
          id: roleId,
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

    if (name) {
      userToUpdate.name = name;
    }

    if (status) {
      userToUpdate.status = status;
    }

    if (username) {
      const checkUsername = await this.userRepository.findOne({
        where: { username: username },
      });
      if (checkUsername && checkUsername.id != userToUpdate.id) {
        throw new ConflictException({
          statusCode: 409,
          message: `USER_EXIST`,
          param: username,
        }).getResponse();
      }
      userToUpdate.username = username;
    }

    if (mobileNumber) {
      userToUpdate.mobile_number = mobileNumber;
    }

    userToUpdate.updated_by = user;

    await this.userRepository.save(userToUpdate);

    return ApiResponse(
      null,
      200,
      this.langService.getTranslation('UPDATED_SUCCESSFULLY', 'User'),
    );
  }

  async createUser(createUserDto: CreateUserDto, userId: number) {
    const { name, password, username, roleId, mobileNumber } = createUserDto;

    const oldUserByEmail = await this.userRepository.findOne({
      where: { username: username },
    });

    if (oldUserByEmail) {
      throw new ConflictException({
        statusCode: 409,
        message: `USER_EXIST`,
        param: username,
      });
    }

    const role = await this.roleRepository.findOne({ where: { id: roleId } });

    if (!role) {
      throw new BadRequestException({
        statusCode: 400,
        message: 'INVALID_ROLE_ID',
      });
    }

    const createdByUser = await this.userRepository.findOne({
      where: { id: userId },
    });

    const hashPassword = AES.encrypt(
      password,
      process.env.ENCRYPTION_KEY,
    ).toString();

    const user = this.userRepository.create({
      name: name,
      username: username,
      password: hashPassword,
      mobile_number: mobileNumber,
      roles: role,
      created_by: createdByUser,
    });

    await this.userRepository.save(user);

    return ApiResponse(
      null,
      201,
      this.langService.getTranslation('CREATED_SUCCESSFULLY', 'User'),
    );
  }

  async logout(req: any) {
    const userToUpdate = await this.findOne({ where: { id: req.user.id } });
    userToUpdate.last_login = new Date();
    const session = await this.sessionRepository.findOne({
      where: { stringToken: req.user.token },
    });
    session.is_expired = true;
    await this.sessionRepository.save(session);
    await this.save(userToUpdate);
    return ApiResponse(null, 200, this.langService.getTranslation('LOGOUT'));
  }

  async changePassword(dtoReq: ChangePasswordDto, req: any) {
    const { password, new_password } = dtoReq;
    const user = await this.userRepository.findOne({
      where: [{ id: req.user.id }],
    });

    if (user.status === UserStatus.INACTIVE) {
      throw new UnauthorizedException({
        statusCode: 401,
        message: 'DISABLED_ACCOUNT',
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
        message: 'WRONG_PASSWORD',
      });
    }
    const hashPassord = AES.encrypt(
      new_password,
      process.env.ENCRYPTION_KEY,
    ).toString();
    user.password = hashPassord;

    await this.userRepository.save(user);

    await this.logout(req);

    return ApiResponse(
      null,
      200,
      this.langService.getTranslation('UPDATED_SUCCESSFULLY', 'User Password'),
    );
  }
}
