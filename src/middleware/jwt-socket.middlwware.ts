import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { AES, enc } from 'crypto-js';
import { UserService } from 'src/services/user.service';

@Injectable()
export class JwtWebSocketMiddleware implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient();
    const token = client.handshake.query.token;

    if (!token) {
      throw new WsException({
        statusCode: 401,
        message: 'TOKEN_REQUIRED',
      });
    }

    try {
      // Decrypt the token using your encryption key
      const decryptedToken = AES.decrypt(
        token,
        process.env.ENCRYPTION_KEY_TOKEN,
      ).toString(enc.Utf8);

      if (!decryptedToken) {
        throw new WsException({
          statusCode: 401,
          message: 'INVALID_TOKEN',
        });
      }

      // Verify the JWT token using your JWT secret
      const decoded = this.jwtService.verify(decryptedToken, {
        secret: process.env.JWT_SECRET,
      });

      // Fetch user information based on the JWT payload
      const user = await this.usersService.findById(decoded.userId);

      if (!user) {
        throw new WsException({
          statusCode: 404,
          message: 'INVALID_TOKEN_USER',
        });
      }

      // Attach the user object to the WebSocket client for later use in handlers
      client.user = user;

      return true;
    } catch (error) {
      throw new WsException({
        statusCode: 401,
        message: 'UNAUTHORIZED_ACCESS',
      });
    }
  }
}
