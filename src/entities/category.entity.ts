import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Product } from './product.entity';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => Category, (category) => category.children, {
    nullable: true,
  })
  @JoinColumn()
  parent: Category;

  @OneToMany(() => Category, (category) => category.parent)
  children: Category[];

  @OneToMany(() => Product, (product) => product.category)
  products: Product[];
}

