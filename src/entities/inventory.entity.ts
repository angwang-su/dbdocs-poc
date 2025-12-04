import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  OneToOne,
  Index,
} from 'typeorm';
import { InventoryMaterial } from './inventoryMaterial.entity';
import { InventoryColumn } from './inventoryColumn.entity';
import { InventorySetting } from './inventorySetting.entity';
import { VARCHAR_SIZE_SET } from 'src/types';

@Entity('inventory')
@Index(['groupId', 'name'], { unique: true, where: '"deletedAt" IS NULL' }) // 그룹 내 인벤토리명 중복 방지
@Index(['groupId', 'updatedAt']) // 그룹별 인벤토리 리스트 조회 (updatedAt DESC 정렬용)
export class Inventory {
  @PrimaryGeneratedColumn('uuid')
  inventoryId: string;

  @Column({ type: 'uuid' })
  groupId: string;

  @Column({ length: VARCHAR_SIZE_SET.LARGE })
  name: string;

  @Column({ length: VARCHAR_SIZE_SET.TINY })
  prefix: string;

  @Column({ type: 'int', default: 1 })
  sequence: number;

  // ===== Timestamps =====
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  // ===== Relations =====

  @OneToOne('InventorySetting', 'inventory', {
    cascade: true,
  })
  setting: InventorySetting;

  @OneToMany(() => InventoryColumn, (column) => column.inventory, {
    cascade: true,
  })
  columns: InventoryColumn[];

  @OneToMany(() => InventoryMaterial, (material) => material.inventory)
  materials: InventoryMaterial[];
}
