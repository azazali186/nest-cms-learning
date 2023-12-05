// socket.service.ts

import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';

@Injectable()
export class WsCustomService {
  private server: Server;

  constructor() {}

  setServer(server: Server): void {
    this.server = server;
  }

  broadcastToClient(clientId: string, event: string, message: any): void {
    this.server.to(clientId).emit(event, message);
  }

  broadcastByEvent(event: string, param2: any) {
    this.server.emit(event, param2);
  }
}
