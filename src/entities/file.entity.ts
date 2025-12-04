import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToOne,
  Index,
} from 'typeorm';
import { InventoryFile } from './inventoryFile.entity';

export enum FileType {
  IMAGE = 'image',
  DOCUMENT = 'document',
  VIDEO = 'video',
  AUDIO = 'audio',
  OTHER = 'other',
}

export enum UploadStatus {
  PENDING = 'pending',
  UPLOADING = 'uploading',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

@Entity('file')
@Index(['groupId'])
@Index(['itemId'])
export class File {
  @PrimaryGeneratedColumn('uuid', {
    comment: '파일 ID',
  })
  fileId: string;

  @Column({
    comment: '그룹 ID',
    type: 'uuid',
    nullable: false,
  })
  groupId: string;

  @Column({
    comment: '아이템 ID',
    type: 'uuid',
    nullable: true,
  })
  itemId?: string;

  @Column({
    comment: '파일 이름',
    type: 'text',
    nullable: false,
  })
  name: string;

  @Column({
    comment: '파일 확장자',
    type: 'varchar',
    length: 50,
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
    type: 'bigint',
    nullable: false,
  })
  size: number;

  @Column({
    comment: '버킷명',
    type: 'varchar',
    length: 50,
    nullable: false,
  })
  bucket: string;

  @Column({
    comment: '파일 업로드 상태',
    type: 'enum',
    enum: UploadStatus,
    nullable: false,
  })
  uploadStatus: UploadStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  // ===== Relations =====

  @OneToOne(() => InventoryFile, (inventoryFile) => inventoryFile.file)
  inventoryFile?: InventoryFile;
}
