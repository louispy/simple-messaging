import { NestFactory } from '@nestjs/core';
import { SeederModule } from './seeder/seeder.module';
import { AdminUserSeederService } from './seeder/user.seeder.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(SeederModule);
  const seeder = app.get(AdminUserSeederService);
  await seeder.seed();
  app.close();
}
bootstrap();
