import { ApiProperty } from '@nestjs/swagger';

export class BroadcastEventDto {
  @ApiProperty()
  event: string;

  @ApiProperty()
  data: any;
}
