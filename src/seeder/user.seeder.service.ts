import { ConfigService } from '@nestjs/config';
import { hash, genSalt } from 'bcrypt';
import { ILogger } from '../logger/logger.interface';
import { User } from '../users/entities/users.schema';
import { UsersRepository } from '../users/users.repository';

export class AdminUserSeederService {
  constructor(
    private readonly repo: UsersRepository,
    private readonly logger: ILogger,
    private readonly config: ConfigService,
  ) {}

  async seed(): Promise<void> {
    this.logger.log('Seeder', 'Seeding users...');
    const salt = await genSalt(parseInt(this.config.get('SALT_ROUNDS') || "10", 10));
    const password = await hash(this.config.get('SEEDER_ADMIN_PASSWORD') || "password", salt);
    const user = new User();
    user.username = 'superadmin';
    user.password = password;
    user.roles = ['superadmin'];
    user.company = '63cb902de99e4e5ba33e6fb5';
    user.createdBy = 'seeder';
    user.updatedBy = 'seeder';
    user.createdAt = new Date();
    user.updatedAt = new Date();
    user.isDeleted = false;
    await this.repo.upsert({ username: user.username }, user);
    this.logger.log('Seeder', 'User seeding completed');
  }
}
