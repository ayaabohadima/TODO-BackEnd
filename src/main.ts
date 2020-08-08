import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
const cors = require('cors');
const logger = require('morgan');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(logger('dev', true));
  app.use(cors());
  await app.listen(3000);
}
bootstrap();
