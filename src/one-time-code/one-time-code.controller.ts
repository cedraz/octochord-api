import { Body, Controller, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { OneTimeCodeService } from './one-time-code.service';
import { CreateOneTimeCodeDto } from './dto/create-one-time-code.dto';
import { OneTimeCodeResponseDto } from './dto/one-time-code-response.dto';
import { ValidateOneTimeCodeDto } from './dto/validate-one-time-code.dto';
import { ValidateResponseDto } from './dto/validate-response.dto';
import { VerifyUserAccountDto } from './dto/verify-user-account.dto';

@Controller('one-time-code')
@ApiTags('One Time Code')
export class OneTimeCodeController {
  constructor(private readonly oneTimeCodeService: OneTimeCodeService) {}

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
