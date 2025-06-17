import { Controller, Get, Head } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@Controller()
@ApiTags('App')
export class AppController {
  @Get()
  getHello(): string {
    return 'API is running!';
  }

  @Get('health')
  health(): string {
    return 'API Running Smoothly! Health Check Passed!';
  }

  @Head()
  getHead(): string {
    return 'Hello World!';
  }
}
