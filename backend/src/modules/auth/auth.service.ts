import { Injectable, ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../../typeorm/entities/users';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  // Password policy validation
  private validatePasswordPolicy(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return { valid: errors.length === 0, errors };
  }

  async register(registerDto: RegisterDto) {
    const { email, password, name, phone, address } = registerDto;

    // Validate password policy
    const passwordValidation = this.validatePasswordPolicy(password);
    if (!passwordValidation.valid) {
      throw new BadRequestException(passwordValidation.errors.join('. '));
    }

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user (default role: customer)
    const user = this.userRepository.create({
      name,
      email,
      password: hashedPassword,
      phone,
      address,
      role: UserRole.CUSTOMER,
    });

    await this.userRepository.save(user);

    // Return user without password
    const { password: _, ...result } = user;
    return {
      message: 'Registration successful',
      user: result,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Find user by email
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Return user without password
    const { password: _, ...result } = user;
    return {
      message: 'Login successful',
      user: result,
    };
  }

  async getProfile(userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const { password: _, ...result } = user;
    return result;
  }

  async updateProfile(userId: number, updateData: Partial<User>) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Don't allow updating role or password through this method
    delete updateData.role;
    delete updateData.password;

    await this.userRepository.update(userId, updateData);
    
    const updatedUser = await this.userRepository.findOne({ where: { id: userId } });
    if (!updatedUser) {
      throw new UnauthorizedException('User not found');
    }
    const { password: _, ...result } = updatedUser;
    return {
      message: 'Profile updated successfully',
      user: result,
    };
  }

  async changePassword(userId: number, currentPassword: string, newPassword: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Validate new password policy
    const passwordValidation = this.validatePasswordPolicy(newPassword);
    if (!passwordValidation.valid) {
      throw new BadRequestException(passwordValidation.errors.join('. '));
    }

    // Hash new password and update
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.userRepository.update(userId, { password: hashedPassword });

    return { message: 'Password changed successfully' };
  }
}
