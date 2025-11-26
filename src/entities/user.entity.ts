import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Order } from './order.entity';
import { Review } from './review.entity';
import { UserProfile } from './user-profile.entity';
import { Cart } from './cart.entity';
import { Address } from './address.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  email: string;

  @Column({ length: 255 })
  password: string;

  @Column({ length: 50 })
  name: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => UserProfile, (profile) => profile.user)
  profile: UserProfile;

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];

  @OneToMany(() => Review, (review) => review.user)
  reviews: Review[];

  @OneToOne(() => Cart, (cart) => cart.user)
  cart: Cart;

  @OneToMany(() => Address, (address) => address.user)
  addresses: Address[];
}

