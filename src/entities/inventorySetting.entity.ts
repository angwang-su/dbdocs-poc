import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  Index,
  DeleteDateColumn,
} from 'typeorm';
import { Inventory } from './inventory.entity';

/**
 * 인벤토리 설정 테이블
 * - Material ID 생성에 사용되는 prefix, sequence 관리
 * - Inventory와 1:1 관계
 */
@Entity('inventorySetting')
@Index(['inventoryId'], { unique: true })
export class InventorySetting {
  @PrimaryGeneratedColumn('uuid')
  inventorySettingId: string;

  @Column({ type: 'uuid' })
  inventoryId: Inventory['inventoryId'];

  @Column({ length: 5, default: 'ANT' })
  prefix: string; // Material ID prefix (예: ANT)

  @Column({ type: 'int', default: 1 })
  sequence: number; // 다음 Material에 부여할 sequence

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  // ===== Relations =====

  @OneToOne(() => Inventory, (inventory) => inventory.setting, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'inventoryId', referencedColumnName: 'inventoryId' })
  inventory: Inventory;
}
