import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('faqs')
export class Faq {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 500 })
  question: string;

  @Column({ type: 'text' })
  answer: string;

  @Column({ default: 'general' })
  category: string;

  @Column({ default: 0 })
  sortOrder: number;

  @Column({ default: true })
  isPublished: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

