import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('email_templates')
export class EmailTemplate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 100 })
  slug: string;

  @Column({ length: 200 })
  name: string;

  @Column({ length: 300 })
  subject: string;

  @Column({ type: 'text' })
  bodyHtml: string;

  @Column({ type: 'text', nullable: true })
  bodyText: string;

  @Column({ type: 'jsonb', nullable: true })
  variables: string[];

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

