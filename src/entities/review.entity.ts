import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Product } from './product.entity';

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  rating: number;

  @Column({ type: 'text', nullable: true })
  comment: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.reviews)
  @JoinColumn()
  user: User;

  @ManyToOne(() => Product, (product) => product.reviews)
  @JoinColumn()
  product: Product;
}

