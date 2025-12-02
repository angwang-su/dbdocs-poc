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
import { InventoryFileMetadata } from './inventoryFileMetadata.entity';
import { VARCHAR_SIZE_SET } from 'src/types';

export const FileType = {
  ORIGINAL: 'original', // 사용자가 업로드한 원본 파일
  CONVERTED: 'converted', // 원본 파일을 다른 확장자 등으로 변환한 파일
  RAG: 'rag', // 원본 파일을 RAG를 사용하기 위하여 가공한 파일
  REFERENCE: 'reference', // 원본파일 내에 포함된 참고 파일 (이미지 등)
} as const;

export type FileType = (typeof FileType)[keyof typeof FileType];

export const UploadStatus = {
  UPLOADING: 'uploading',
  UPLOADED: 'uploaded',
  DELETED: 'deleted',
} as const;

export type UploadStatus = (typeof UploadStatus)[keyof typeof UploadStatus];

/**
 * 인벤토리 파일 테이블
 * - Default 파일 컬럼: inventoryColumnId가 null
 * - 커스텀 파일 컬럼: inventoryColumnId가 해당 컬럼 ID
 * - 다중 파일 지원
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
  inventoryColumnId: InventoryColumn['inventoryColumnId'];

  @Column({
    comment: '파일 이름',
    type: 'text',
    nullable: false,
  })
  name: string;

  @Column({
    comment: '파일 확장자',
    type: 'varchar',
    length: VARCHAR_SIZE_SET.SMALL,
    nullable: false,
  })
  extension: string;

  @Column({
    comment: '파일이 업로드 된 S3의 Object Key',
    type: 'text',
    nullable: false,
  })
  s3Key: string;

  @Column({
    comment: '파일 유형',
    type: 'enum',
    enum: FileType,
    nullable: false,
  })
  type: FileType;

  @Column({
    comment: '파일 다운로드 Url',
    type: 'text',
    nullable: false,
  })
  url: string;

  @Column({
    comment: '파일 크기',
    type: 'int8',
    nullable: false,
  })
  size: number;

  @Column({
    comment: '버킷명',
    type: 'varchar',
    length: VARCHAR_SIZE_SET.SMALL,
    nullable: false,
  })
  bucket: string;

  @Column({
    comment: '파일 업로드 상태',
    type: 'enum',
    nullable: false,
    enum: UploadStatus,
  })
  uploadStatus: UploadStatus;

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

  @OneToOne(() => InventoryFileMetadata, (metadata) => metadata.file)
  fileMetadata?: InventoryFileMetadata;
}
