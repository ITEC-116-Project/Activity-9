import { Controller, Post, Body, Get, Put, Param, ParseIntPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  // For simplicity, using userId in URL (in real app, use JWT token)
  @Get('profile/:userId')
  getProfile(@Param('userId', ParseIntPipe) userId: number) {
    return this.authService.getProfile(userId);
  }

  @Put('profile/:userId')
  updateProfile(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() updateData: Partial<{ name: string; email: string; phone: string; address: string }>,
  ) {
    return this.authService.updateProfile(userId, updateData);
  }

  @Put('profile/:userId/password')
  changePassword(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() passwordData: { currentPassword: string; newPassword: string },
  ) {
    return this.authService.changePassword(userId, passwordData.currentPassword, passwordData.newPassword);
  }
}
