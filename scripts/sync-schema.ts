import 'reflect-metadata';
import { AppDataSource } from '../src/database/data-source';

async function syncSchema() {
  try {
    console.log('Initializing data source...');
    await AppDataSource.initialize();
    console.log('Data source initialized successfully');

    console.log('Synchronizing schema...');
    await AppDataSource.synchronize();
    console.log('Schema synchronized successfully');

    await AppDataSource.destroy();
    console.log('Connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error syncing schema:', error);
    process.exit(1);
  }
}

syncSchema();
