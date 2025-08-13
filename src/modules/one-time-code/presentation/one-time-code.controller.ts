import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { OneTimeCodeResponseDto } from '../application/dto/one-time-code-response.dto';
import { CreateOneTimeCodeDto } from '../application/dto/create-one-time-code.dto';
import { ValidateResponseDto } from '../application/dto/validate-response.dto';
import { ValidateOneTimeCodeDto } from '../application/dto/validate-one-time-code.dto';
import { VerifyUserAccountDto } from '../application/dto/verify-user-account.dto';
import { OneTimeCodeServiceAPI } from '../application/one-time-code.service.interface';
import { OTC_SERVICE_TOKEN } from 'src/common/tokens/tokens';

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
  @ApiOperation({
    summary: 'Validate a verification request',
  })
  @ApiOkResponse({
    type: ValidateResponseDto,
  })
  validateOneTimeCode(@Body() validateOneTimeCodeDto: ValidateOneTimeCodeDto) {
    return this.oneTimeCodeService.validateOneTimeCode(validateOneTimeCodeDto);
  }

  @ApiOperation({
    summary: 'Validate a verification request for change email',
  })
  @Post('change-email-validation')
  validateChangeEmailRequest(
    @Body() validateOneTimeCodeDto: ValidateOneTimeCodeDto,
  ) {
    return this.oneTimeCodeService.validateChangeEmailRequest(
      validateOneTimeCodeDto,
    );
  }

  @ApiOperation({
    summary: 'Verify an email (only for common user email verification)',
  })
  @Post('verify-email')
  verifyUserAccount(
    @Body() verifyUserAccountDto: VerifyUserAccountDto,
  ): Promise<boolean> {
    return this.oneTimeCodeService.verifyUserAccount(verifyUserAccountDto);
  }
}
