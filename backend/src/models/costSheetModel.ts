import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { User } from './userModel';

export interface CostSheetAttributes {
  id: number;
  requirement_type: 'Technical' | 'Non-Technical';
  total_value: number;
  status: 'Draft' | 'Pending Approval' | 'Approved' | 'Rejected' | 'Sent Back' | 'PO Requested';

  initiator_id: number;
  created_at: Date;
  updated_at: Date;
  po_status?: string;
  po_date?: Date;
  final_approval_status?: string;
  currency: string;
  entry_type: string;
}

export type CostSheetCreationAttributes = Optional<CostSheetAttributes, 'id' | 'created_at' | 'updated_at'>;

export class CostSheet extends Model<CostSheetAttributes, CostSheetCreationAttributes> implements CostSheetAttributes {
  public id!: number;

  public requirement_type!: 'Technical' | 'Non-Technical';
  public total_value!: number;
  public status!: 'Draft' | 'Pending Approval' | 'Approved' | 'Rejected' | 'Sent Back' | 'PO Requested';
  public progress!: number;
  public initiator_id!: number;
  public created_at!: Date;
  public updated_at!: Date;
  public po_status?: string;
  public po_date?: Date;
  public final_approval_status?: string;
  public currency!: string;
  public entry_type!: string;
}

CostSheet.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    requirement_type: {
      type: DataTypes.ENUM('Technical', 'Non-Technical'),
      allowNull: false,
    },
    total_value: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('Draft', 'Pending Approval', 'Approved', 'Rejected', 'Sent Back', 'PO Requested'),
      allowNull: false,
      defaultValue: 'Draft',
    },

    initiator_id: {
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
    po_status: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    po_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    final_approval_status: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    currency: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: 'INR',
    },
    entry_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
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

CostSheet.belongsTo(User, { foreignKey: 'initiator_id', as: 'creator' });
