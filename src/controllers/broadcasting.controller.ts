// your.controller.ts

import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { WsCustomService } from 'src/services/ws.service';
import { BroadcastEventDto } from '../dto/broadcast-event.dto';
import { ApiResponse } from '../utils/response.util';

@Controller('broadcast')
@ApiBearerAuth()
@ApiTags('Broadcasting Management')
export class BroadcastingController {
  constructor(private readonly wsService: WsCustomService) {}

  @Get('/:clientId/:event/:message')
  broadcastToClient(
    @Param('clientId') clientId: string,
    @Query('message') message: string,
    @Query('event') event: string,
  ): string {
    this.wsService.broadcastToClient(clientId, event, { message });
    return 'Message sent to client!';
  }

  @Post('')
  broadcastEvent(@Body() message: BroadcastEventDto) {
    this.wsService.broadcastByEvent(message.event, message.data);
    return ApiResponse({}, 200, 'Message sent to client!');
  }
}
