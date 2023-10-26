/* eslint-disable @typescript-eslint/no-unused-vars */
// check-permission.middleware.ts
import { Injectable, NestMiddleware, ForbiddenException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/services/user.service';
import { AES, enc } from 'crypto-js';
import {
  EXCLUDED_ROUTES,
  getPermissionNameFromRoute,
} from 'src/utils/helper.utils';
// Assuming you have a service for users

@Injectable()
export class CheckPermissionMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UserService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const routeWithoutId = req.baseUrl.replace(/\/[a-f0-9-]+$/, '/:id');

    const currentPermission = getPermissionNameFromRoute(
      routeWithoutId,
      req.method,
    )
      .toUpperCase()
      .replaceAll('-', '_');

    if (EXCLUDED_ROUTES.includes(currentPermission.toUpperCase())) {
      next();
    } else {
      const authHeader = req.headers.authorization;
      if (authHeader) {
        const token = authHeader.split(' ')[1];
        // try {
        const decryptedToken = AES.decrypt(
          token,
          process.env.ENCRYPTION_KEY_TOKEN,
        ).toString(enc.Utf8);
        const decoded = this.jwtService.verify(decryptedToken, {
          secret: process.env.JWT_SECRET,
        });
        const user = await this.usersService.findById(decoded.userId);
        // console.log('user  ', user);
        if (
          user?.roles?.some((role) =>
            role.permissions.some(
              (permission) => permission.name === currentPermission,
            ),
          )
        ) {
          next();
        } else {
          throw new ForbiddenException(
            'You do not have permission to access this route',
          );
        }
        // } catch (error) {
        //   throw new ForbiddenException('Invalid token or permission denied');
        // }
      } else {
        throw new ForbiddenException('Token is required');
      }
    }
  }
}
