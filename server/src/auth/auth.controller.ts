import { Controller, Post, Body, Get, Query, HttpException, HttpStatus, Res, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Response } from 'express';
import { AuthGuard } from './auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    try {
      const { email } = registerDto;
      const existingUser = await this.authService.findUserByEmail(email);
      if (existingUser) {
        throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);
      }

      const user = await this.authService.register(registerDto);
      await this.authService.sendVerificationEmail(user.email, user.verificationToken);
      return { message: 'Registration successful! Please check your email to verify your account.' };
    } catch (error) {
      throw new HttpException(error.message || 'Registration failed', HttpStatus.BAD_REQUEST);
    }
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res() res: Response) {
    try {
      const { email, password } = loginDto;
      await this.authService.login(email, password, res);
      return res.status(200).send({ message: 'Login successful!' });
    } catch (error) {
      throw new HttpException(error.message || 'Login failed', HttpStatus.BAD_REQUEST);
    }
  }

  @Post('logout')
  async logout(@Res() res: Response) {
    try {
      await this.authService.logout(res);
      return res.send({ message: 'Logout successful!' });
    } catch (error) {
      throw new HttpException(error.message || 'Logout failed', HttpStatus.BAD_REQUEST);
    }
  }

  @Get('verify')
  async verify(@Query('token') token: string) {
    try {
      const result = await this.authService.verify(token);
      return { message: result };
    } catch (error) {
      throw new HttpException(error.message || 'Verification failed', HttpStatus.BAD_REQUEST);
    }
  }
}

@Controller('dashboard')
@UseGuards(AuthGuard)
export class DashboardController {
  @Get()
  getDashboard(@Req() req) {
    console.log('User authenticated:', req.user); // Лог для діагностики
    return { message: 'Welcome to your dashboard!' };
  }
}