/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtWebSocketMiddleware } from 'src/middleware/jwt-socket.middlwware';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class WsGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  @UseGuards(JwtWebSocketMiddleware)
  handleConnection(client: any, ...args: any[]) {
    // This event handler will only be executed if the client is authenticated.
    // The user payload from the JWT is attached to the client.
  }

  @SubscribeMessage('message')
  handleMessage(
    @MessageBody() data: string,
    @ConnectedSocket() client: Socket,
  ) {
    return data; // Broadcast the message to all connected clients
  }
}
