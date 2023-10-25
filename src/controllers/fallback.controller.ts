import { All, BadRequestException, Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Not Found Route Management')
@Controller()
export class FallbackController {
  // Fallback route
  @All('*')
  handleFallback() {
    throw new BadRequestException({
      statusCode: 400,
      message: `bad request`,
    });
  }
}
