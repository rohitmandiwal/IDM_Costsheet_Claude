import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { CostSheet } from './costSheetModel';

export interface PRLineItemAttributes {
  id: number;
  cost_sheet_id: number;
  pr_number: string;
  line_number: string;
  part_code: string;
  description: string;
  quantity: number;
  uom: string;
  plant: string;
  pr_price: number;
  last_year_price: number;
  po_number?: string;
  is_selected: boolean;
  selected_vendor_id?: number;
  final_unit_price?: number;
  final_total_value?: number;
  tax_code?: string;
  payment_terms?: string;
  delivery_terms?: string;
  specifications?: string;
  created_at: Date;
  updated_at: Date;
}

export type PRLineItemCreationAttributes = Optional<PRLineItemAttributes, 'id' | 'created_at' | 'updated_at'>;

export class PRLineItem extends Model<PRLineItemAttributes, PRLineItemCreationAttributes> implements PRLineItemAttributes {
  public id!: number;
  public cost_sheet_id!: number;
  public pr_number!: string;
  public line_number!: string;
  public part_code!: string;
  public description!: string;
  public quantity!: number;
  public uom!: string;
  public plant!: string;
  public pr_price!: number;
  public last_year_price!: number;
  public po_number?: string;
  public is_selected!: boolean;
  public selected_vendor_id?: number;
  public final_unit_price?: number;
  public final_total_value?: number;
  public tax_code?: string;
  public payment_terms?: string;
  public delivery_terms?: string;
  public specifications?: string;
  public created_at!: Date;
  public updated_at!: Date;
}

PRLineItem.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    cost_sheet_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: CostSheet,
        key: 'id',
      },
    },
    pr_number: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    line_number: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    part_code: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    quantity: {
      type: DataTypes.DECIMAL(15, 3),
      allowNull: false,
    },
    uom: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    plant: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    pr_price: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },
    last_year_price: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },
    po_number: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    is_selected: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    selected_vendor_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    final_unit_price: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },
    final_total_value: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },
    tax_code: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    payment_terms: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    delivery_terms: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    specifications: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'pr_line_items',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

PRLineItem.belongsTo(CostSheet, { foreignKey: 'cost_sheet_id', as: 'costSheet' });
