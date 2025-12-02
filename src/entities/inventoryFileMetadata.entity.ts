import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { InventoryFile } from './inventoryFile.entity';

/**
 * 인벤토리 파일 메타데이터 테이블
 * - 파일에 대한 추가 메타데이터 저장
 * - InventoryFile과 1:1 관계
 */
@Entity({
  name: 'inventoryFileMetadata',
  comment: '인벤토리 파일 메타데이터',
})
@Index(['inventoryFileId'], { unique: true, where: '"deletedAt" IS NULL' })
export class InventoryFileMetadata {
  @PrimaryGeneratedColumn('uuid', {
    comment: '파일 메타데이터 ID',
  })
  inventoryFileMetadataId: string;

  @Column({
    comment: '파일 ID',
    type: 'uuid',
    nullable: false,
  })
  inventoryFileId: InventoryFile['inventoryFileId'];

  @Column({
    comment: '메타데이터',
    type: 'jsonb',
    nullable: false,
  })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  // ===== Relations =====

  @OneToOne(() => InventoryFile, (file) => file.fileMetadata)
  @JoinColumn({
    name: 'inventoryFileId',
    referencedColumnName: 'inventoryFileId',
  })
  file?: InventoryFile;
}

