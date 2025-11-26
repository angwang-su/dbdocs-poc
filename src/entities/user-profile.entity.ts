import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('user_profiles')
export class UserProfile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  bio: string;

  @Column({ nullable: true })
  avatarUrl: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ type: 'date', nullable: true })
  birthDate: Date;

  @OneToOne(() => User, (user) => user.profile)
  @JoinColumn()
  user: User;
}

