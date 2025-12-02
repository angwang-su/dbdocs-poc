import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { InventoryMaterial } from './inventoryMaterial.entity';
import { InventoryColumn } from './inventoryColumn.entity';

/**
 * 인벤토리 물질 컬럼 값 저장 테이블
 * - Default 컬럼(ID, 이름, 화학구조)과 Custom 컬럼 값 모두 저장
 * - 파일, 연동문서는 별도 테이블에서 다중 관리
 */
@Entity('inventoryMaterialValue')
@Index(['inventoryMaterialId', 'inventoryColumnId'], {
  unique: true,
  where: '"deletedAt" IS NULL',
}) // Material + Column 조합 중복 방지
@Index(['inventoryMaterialId']) // Material별 모든 값 조회
@Index(['inventoryColumnId']) // 특정 컬럼의 모든 값 조회 (컬럼별 필터/검색용)
export class InventoryMaterialValue {
  @PrimaryGeneratedColumn('uuid')
  inventoryMaterialValueId: string;

  @Column({ type: 'uuid' })
  inventoryMaterialId: string;

  @Column({ type: 'uuid' })
  inventoryColumnId: string;

  // ===== 타입별 값 저장 (해당 타입만 값이 들어감) =====

  @Column({ type: 'text', nullable: true })
  textValue: string; // type: text, hyperlink, ID(materialCode), name

  @Column({ type: 'decimal', precision: 20, scale: 6, nullable: true })
  numberValue: number; // type: number

  @Column({ type: 'timestamp', nullable: true })
  dateValue: Date; // type: date (P2)

  @Column({ length: 200, nullable: true })
  selectValue: string; // type: select (P2)

  @Column({ type: 'jsonb', nullable: true })
  chemicalStructureValue: Record<string, any>; // type: chemical_structure
  /*
    {
      "format": "mrv",
      "data": "<?xml version=\"1.0\" encoding=\"UTF-8\"?><cml>...</cml>",
      "smiles": "CCO",
      "imageUrl": "https://storage.example.com/structures/abc123.png"
    }
  */

  // ===== Timestamps =====

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  // ===== Relations =====

  @ManyToOne(() => InventoryMaterial, (material) => material.values, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'inventoryMaterialId' })
  material: InventoryMaterial;

  @ManyToOne(() => InventoryColumn, (column) => column.values, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'inventoryColumnId' })
  column: InventoryColumn;
}
