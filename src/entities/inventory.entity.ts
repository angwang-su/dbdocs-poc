import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { InventoryMaterial } from './inventoryMaterial.entity';
import { InventoryColumn } from './inventoryColumn.entity';

@Entity('inventory')
@Index(['groupId', 'name'], { unique: true, where: '"deleted_at" IS NULL' })
export class Inventory {
  @PrimaryGeneratedColumn('uuid')
  inventoryId: string;

  @Column({ type: 'uuid' })
  groupId: string;

  @Column({ length: 200 })
  name: string;

  // ===== Material ID 생성 설정 =====

  @Column({ length: 5, default: 'ANT' })
  prefix: string; // Material ID prefix (예: ANT)

  @Column({ type: 'int', default: 1 })
  sequence: number; // 다음 Material에 부여할 sequence

  // ===== Timestamps =====

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  // ===== Relations =====

  @OneToMany(() => InventoryColumn, (column) => column.inventory, {
    cascade: true,
  })
  columns: InventoryColumn[];

  @OneToMany(() => InventoryMaterial, (material) => material.inventory)
  materials: InventoryMaterial[];
}
