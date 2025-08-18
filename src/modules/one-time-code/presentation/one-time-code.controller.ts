import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { OneTimeCodeResponseDto } from '../application/dto/one-time-code-response.dto';
import { CreateOneTimeCodeDto } from '../application/dto/create-one-time-code.dto';
import { ValidateOneTimeCodeDto } from '../application/dto/validate-one-time-code.dto';
import { OneTimeCodeServiceAPI } from '../application/one-time-code.service.interface';
import { OTC_SERVICE_TOKEN } from 'src/shared/tokens/tokens';

@Controller('one-time-code')
@ApiTags('One Time Code')
export class OneTimeCodeController {
  constructor(
    @Inject(OTC_SERVICE_TOKEN)
    private readonly oneTimeCodeService: OneTimeCodeServiceAPI,
  ) {}

  @ApiOperation({
    summary: 'Create a verification request (not for user creation)',
  })
  @Post('create-one-time-code')
  @ApiOkResponse({
    type: OneTimeCodeResponseDto,
  })
  createOneTimeCode(@Body() createOneTimeCodeDto: CreateOneTimeCodeDto) {
    return this.oneTimeCodeService.createOneTimeCode({
      createOneTimeCodeDto,
    });
  }

  @Post('validate-one-time-code')
  @ApiOperation({ summary: 'Validate a verification request' })
  validateOneTimeCode(@Body() validateOneTimeCodeDto: ValidateOneTimeCodeDto) {
    return this.oneTimeCodeService.validateOneTimeCode(validateOneTimeCodeDto);
  }
}
