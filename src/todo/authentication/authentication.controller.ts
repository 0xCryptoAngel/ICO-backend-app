import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { CreateUserDto } from '../dto/user.dto';
import { LocalAuthenticationGuard } from './localAuthentication.guard';
import { RequestWithUser } from './authentication.interface';
import { Response } from 'express';
import JwtAuthenticationGuard from './jwt-authentication.guard';
import { authenticator } from 'otplib';

@Controller('auth')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  //@UseGuards(JwtAuthenticationGuard)
  @Get()
  authenticate(@Req() request: RequestWithUser) {
    const user = request.user;
    user.password = undefined;
    return user;
  }

  @Post()
  async register(@Body() registrationData: CreateUserDto) {
    return await this.authenticationService.register(registrationData);
  }

  @HttpCode(200)
  @UseGuards(LocalAuthenticationGuard)
  @Post('log-in')
  async logIn(
    @Body() { totp_code: totp_code },
    @Req() request: RequestWithUser,
    @Res() response: Response,
  ) {
    const { user } = request;
    if (!authenticator.check(totp_code, user.secret)) {
      throw new HttpException(
        'Authenticator Code Invalid',
        HttpStatus.UNAUTHORIZED,
      );
    }
    const cookie = this.authenticationService.getCookieWithJwtToken(user.email);
    response.setHeader('Access-Control-Allow-Headers', 'Authorization');
    response.setHeader('Set-Cookie', cookie);
    user.password = undefined;
    return response.send(user);
  }

  //@UseGuards(JwtAuthenticationGuard)
  @Post('log-out')
  async logOut(@Req() request: RequestWithUser, @Res() response: Response) {
    response.setHeader(
      'Set-Cookie',
      this.authenticationService.getCookieForLogOut(),
    );
    return response.sendStatus(200);
  }
}
