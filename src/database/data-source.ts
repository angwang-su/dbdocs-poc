import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '54322'),
  username: process.env.DB_USERNAME || 'erd-test',
  password: process.env.DB_PASSWORD || 'erd-test',
  database: process.env.DB_DATABASE || 'erd-test',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  // CI/CD에서 DBML 생성 시에만 true, 프로덕션에서는 false
  // 프로덕션에서는 migration 사용 권장
  synchronize: process.env.TYPEORM_SYNC === 'true',
});
