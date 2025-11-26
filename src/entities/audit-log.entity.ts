import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  entityName: string;

  @Column()
  entityId: number;

  @Column({ length: 50 })
  action: string;

  @Column({ type: 'jsonb', nullable: true })
  oldValue: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  newValue: Record<string, any>;

  @Column({ nullable: true })
  performedBy: number;

  @Column({ nullable: true })
  ipAddress: string;

  @CreateDateColumn()
  createdAt: Date;
}

