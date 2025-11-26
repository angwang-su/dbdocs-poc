import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('countries')
export class Country {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 2, unique: true })
  code: string;

  @Column({ length: 3, unique: true })
  code3: string;

  @Column({ nullable: true })
  phoneCode: string;

  @Column({ nullable: true })
  currency: string;

  @Column({ default: true })
  isActive: boolean;
}

