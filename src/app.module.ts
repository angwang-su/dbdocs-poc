import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppDataSource } from './database/data-source';

@Module({
  imports: [TypeOrmModule.forRoot(AppDataSource.options)],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
