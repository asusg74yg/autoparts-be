import {
  Controller,
  Body,
  Post,
  HttpStatus,
  HttpCode,
  Param,
  Patch,
  Get,
} from '@nestjs/common';
import { signUpSchema, SignUpSchemaDTO } from 'src/auth/dto/signup-user.dto';
import { signInSchema, SignInSchemaDTO } from 'src/auth/dto/signin.dto';
import { AuthService } from './auth.service';
import { Public } from 'common/decorator/public.decorator';
import { ZodValidationPipe } from 'common/validator/zod.validator';
import { ApiBody, ApiParam } from '@nestjs/swagger';

import { RefreshSchema, RefreshSchemaDTO } from './dto/refresh.dto';
import { changePasswordSchema } from './dto/change_password.dto';

@Public()
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @ApiBody({ type: () => SignUpSchemaDTO })
  @Post('/signup')
  async signUp(@Body(new ZodValidationPipe(signUpSchema)) body) {
    return this.authService.signUp(body);
  }

  @HttpCode(HttpStatus.OK)
  @ApiBody({ type: () => SignInSchemaDTO })
  @Post('/signin')
  signIn(@Body(new ZodValidationPipe(signInSchema)) body) {
    return this.authService.signIn(body);
  }

  @HttpCode(HttpStatus.OK)
  @ApiBody({ type: () => SignInSchemaDTO })
  @Get('/getotp/:email')
  getOTP(@Param('email') email: string) {
    return this.authService.getOTP(email);
  }

  @HttpCode(HttpStatus.OK)
  @ApiBody({ type: () => SignInSchemaDTO })
  @Post('/changePassword')
  changePassword(@Body(new ZodValidationPipe(changePasswordSchema)) body) {
    return this.authService.passwordChange(body.email, body.password, body.otp);
  }

  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', description: 'User ID', type: String })
  @Get('logout/:id')
  logout(@Param('id') id: string) {
    console.log(id);
    return this.authService.logout(id);
  }

  @HttpCode(HttpStatus.OK)
  @ApiBody({ type: () => RefreshSchemaDTO })
  @ApiParam({ name: 'id', description: 'User ID', type: String })
  @Patch('/refresh/:id')
  refreshTokens(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(RefreshSchema)) body,
  ) {
    return this.authService.updateRefreshToken(id, body.refreshToken);
  }
}
