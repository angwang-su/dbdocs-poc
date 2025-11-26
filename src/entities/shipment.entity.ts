import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Order } from './order.entity';

export enum ShipmentStatus {
  PREPARING = 'preparing',
  SHIPPED = 'shipped',
  IN_TRANSIT = 'in_transit',
  DELIVERED = 'delivered',
}

@Entity('shipments')
export class Shipment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  trackingNumber: string;

  @Column({ nullable: true })
  carrier: string;

  @Column({
    type: 'enum',
    enum: ShipmentStatus,
    default: ShipmentStatus.PREPARING,
  })
  status: ShipmentStatus;

  @Column({ type: 'timestamp', nullable: true })
  estimatedDelivery: Date;

  @Column({ type: 'timestamp', nullable: true })
  deliveredAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => Order, (order) => order.shipment)
  @JoinColumn()
  order: Order;
}

