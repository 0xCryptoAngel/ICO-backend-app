import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { TodoModule } from './todo/todo.module';
require('dotenv').config();
const MONGODB_URI = process.env.MONGODB_URI;
@Module({
  imports: [MongooseModule.forRoot(MONGODB_URI), TodoModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
