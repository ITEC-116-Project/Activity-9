import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../typeorm/entities/users';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async onModuleInit() {
    await this.seedAdminUser();
  }

  async seedAdminUser() {
    // Check if admin already exists
    const existingAdmin = await this.userRepository.findOne({
      where: { email: 'admin@shop.com' },
    });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);

      const admin = this.userRepository.create({
        name: 'Admin',
        email: 'admin@shop.com',
        password: hashedPassword,
        role: UserRole.ADMIN,
        phone: '123-456-7890',
        address: 'Admin Office, Shop HQ',
      });

      await this.userRepository.save(admin);
      console.log('✅ Default admin account created');
      console.log('   Email: admin@shop.com');
      console.log('   Password: admin123');
    } else {
      console.log('ℹ️ Admin account already exists');
    }
  }
}
