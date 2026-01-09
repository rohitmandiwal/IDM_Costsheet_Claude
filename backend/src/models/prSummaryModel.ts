import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { CostSheet } from './costSheetModel';

export interface PRSummaryAttributes {
  id: number;
  cost_sheet_id: number;
  pr_number: string;
  description: string;
  plant: string;
  requester: string;
  line_item_count: number;
  estimated_value: number;
  created_at: Date;
}

export type PRSummaryCreationAttributes = Optional<PRSummaryAttributes, 'id' | 'created_at'>;

export class PRSummary extends Model<PRSummaryAttributes, PRSummaryCreationAttributes> implements PRSummaryAttributes {
  public id!: number;
  public cost_sheet_id!: number;
  public pr_number!: string;
  public description!: string;
  public plant!: string;
  public requester!: string;
  public line_item_count!: number;
  public estimated_value!: number;
  public created_at!: Date;
}

PRSummary.init(
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
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    plant: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    requester: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    line_item_count: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    estimated_value: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'pr_summaries',
    timestamps: false,
  }
);

PRSummary.belongsTo(CostSheet, { foreignKey: 'cost_sheet_id', as: 'costSheet' });
