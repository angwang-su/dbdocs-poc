import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { Inventory } from './inventory.entity';
import { InventoryMaterialValue } from './inventoryMaterialValue.entity';

export enum InventoryColumnType {
  TEXT = 'text',
  NUMBER = 'number',
  FILE = 'file',
  CHEMICAL_STRUCTURE = 'chemicalStructure',
  LINKED_LABNOTE = 'linkedLabnote',
  HYPERLINK = 'hyperlink',
  SELECT = 'select', // P2
  DATE = 'date', // P2
}

@Entity('inventoryColumn')
@Index(['inventoryId', 'name'], { unique: true, where: '"deleted_at" IS NULL' })
export class InventoryColumn {
  @PrimaryGeneratedColumn('uuid')
  inventoryColumnId: string;

  @Column({ type: 'uuid' })
  inventoryId: string;

  @Column({ length: 200 })
  name: string;

  @Column({
    type: 'enum',
    enum: InventoryColumnType,
    default: InventoryColumnType.TEXT,
  })
  type: InventoryColumnType;

  @Column({ default: false })
  isDefault: boolean;

  @Column({ default: false })
  isRequired: boolean;

  @Column({ type: 'int' })
  order: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  // Relations
  @ManyToOne(() => Inventory, (inventory) => inventory.columns, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'inventoryId' })
  inventory: Inventory;

  @OneToMany(() => InventoryMaterialValue, (value) => value.column)
  values: InventoryMaterialValue[];
}
