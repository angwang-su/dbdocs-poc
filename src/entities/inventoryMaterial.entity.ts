import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Inventory } from './inventory.entity';
import { InventoryMaterialValue } from './inventoryMaterialValue.entity';
import { InventoryMaterialFile } from './inventoryMaterialFile.entity';

/**
 * 인벤토리 물질 테이블
 * - 물질의 메타데이터만 저장 (sequence만 보관)
 * - 모든 컬럼 값(ID/materialCode, 이름, 화학구조 포함)은 InventoryMaterialValue에서 관리
 * - 파일, 연동문서는 별도 테이블에서 다중 관리
 */
@Entity('inventoryMaterial')
export class InventoryMaterial {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  inventoryId: string;

  // ===== 물질 식별 정보 =====

  @Column({ type: 'int' })
  materialSequence: number; // 부여받은 sequence (삭제되어도 재사용 안함)
  // materialCode(ANT#1)는 InventoryMaterialValue의 "ID" 컬럼 값으로 저장됨

  // ===== Timestamps =====

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  // ===== Relations =====

  @ManyToOne(() => Inventory, (inventory) => inventory.materials, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'inventoryId' })
  inventory: Inventory;

  // 모든 컬럼 값 (Default + Custom 컬럼 모두 포함)
  // - ID (materialCode: ANT#1)
  // - 이름
  // - 화학구조
  // - 기타 커스텀 컬럼들
  @OneToMany(() => InventoryMaterialValue, (value) => value.material, {
    cascade: true,
  })
  values: InventoryMaterialValue[];

  // 파일 (다중) - Default 파일 컬럼 + 커스텀 파일 컬럼
  @OneToMany(() => InventoryMaterialFile, (file) => file.material)
  files: InventoryMaterialFile[];
}
