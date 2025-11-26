import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '54322'),
  username: process.env.DB_USERNAME || 'erd-test',
  password: process.env.DB_PASSWORD || 'erd-test',
  database: process.env.DB_DATABASE || 'erd-test',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: true,
});

