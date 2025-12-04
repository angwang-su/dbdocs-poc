import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { InventoryMaterial } from './inventoryMaterial.entity';
import { InventoryColumn } from './inventoryColumn.entity';
import { File } from './file.entity';

/**
 * 인벤토리 파일 테이블
 * - Default 파일 컬럼: inventoryColumnId가 null
 * - 커스텀 파일 컬럼: inventoryColumnId가 해당 컬럼 ID
 * - 다중 파일 지원
 * - File 엔티티와 1:1 관계
 */
@Entity('inventoryFile')
@Index(['inventoryMaterialId', 'inventoryColumnId']) // Material + Column별 파일 조회
@Index(['inventoryMaterialId']) // Material별 모든 파일 조회
export class InventoryFile {
  @PrimaryGeneratedColumn('uuid')
  inventoryFileId: string;

  @Column({ type: 'uuid' })
  inventoryMaterialId: InventoryMaterial['inventoryMaterialId'];

  @Column({ type: 'uuid' })
  fileId: File['fileId'];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  // ===== Relations =====

  @ManyToOne(() => InventoryMaterial, (material) => material.files, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'inventoryMaterialId' })
  material: InventoryMaterial;

  @ManyToOne(() => InventoryColumn, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'inventoryColumnId' })
  column: InventoryColumn;

  @OneToOne(() => File, (file) => file.inventoryFile)
  @JoinColumn({ name: 'fileId', referencedColumnName: 'fileId' })
  file: File;
}
