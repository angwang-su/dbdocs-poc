import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export enum DiscountType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
}

@Entity('coupons')
export class Coupon {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 50 })
  code: string;

  @Column({ nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: DiscountType,
  })
  discountType: DiscountType;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  discountValue: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  minPurchaseAmount: number;

  @Column({ type: 'timestamp' })
  validFrom: Date;

  @Column({ type: 'timestamp' })
  validUntil: Date;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: 0 })
  usageCount: number;

  @Column({ nullable: true })
  maxUsage: number;

  @CreateDateColumn()
  createdAt: Date;
}

