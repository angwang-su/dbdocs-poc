import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Product } from './product.entity';

@Entity('tags')
export class Tag {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, unique: true })
  name: string;

  @Column({ nullable: true })
  color: string;

  @ManyToMany(() => Product, (product) => product.tags)
  @JoinTable({
    name: 'product_tags',
    joinColumn: { name: 'tag_id' },
    inverseJoinColumn: { name: 'product_id' },
  })
  products: Product[];
}

