import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { User } from './userModel';

export interface CostSheetAttributes {
  id: string;
  cost_sheet_number: string;
  pr_number: string;
  description: string;
  line_items: number;
  plant: string;
  type: 'Technical' | 'Non-Technical';
  total_value: number;
  status: 'Draft' | 'Submitted' | 'Pending L1' | 'Pending L2' | 'Pending L3' | 'Approved' | 'Sent Back';
  progress: number;
  created_by: number;
  created_at: Date;
  updated_at: Date;
}

export type CostSheetCreationAttributes = Optional<CostSheetAttributes, 'id' | 'progress' | 'created_at' | 'updated_at'>;

export class CostSheet extends Model<CostSheetAttributes, CostSheetCreationAttributes> implements CostSheetAttributes {
  public id!: string;
  public cost_sheet_number!: string;
  public pr_number!: string;
  public description!: string;
  public line_items!: number;
  public plant!: string;
  public type!: 'Technical' | 'Non-Technical';
  public total_value!: number;
  public status!: 'Draft' | 'Submitted' | 'Pending L1' | 'Pending L2' | 'Pending L3' | 'Approved' | 'Sent Back';
  public progress!: number;
  public created_by!: number;
  public created_at!: Date;
  public updated_at!: Date;
}

CostSheet.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    cost_sheet_number: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    pr_number: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    line_items: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    plant: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('Technical', 'Non-Technical'),
      allowNull: false,
    },
    total_value: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('Draft', 'Submitted', 'Pending L1', 'Pending L2', 'Pending L3', 'Approved', 'Sent Back'),
      allowNull: false,
      defaultValue: 'Draft',
    },
    progress: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 100,
      },
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
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
    tableName: 'cost_sheets',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

CostSheet.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
