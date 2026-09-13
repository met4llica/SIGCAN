import { Sequelize, DataTypes, Model, Optional, BelongsToManyGetAssociationsMixin } from 'sequelize';
import type Operativo from './operativo';

interface VeterinarioAttributes {
  id: number;
  nombre: string;
  apellido: string;
  matricula: string;
  especialidad: string | null;
  activo: boolean;
}
interface VeterinarioCreationAttributes extends Optional<VeterinarioAttributes, 'id' | 'activo'> {}

class Veterinario extends Model<VeterinarioAttributes, VeterinarioCreationAttributes> implements VeterinarioAttributes {
  declare id: number;
  declare nombre: string;
  declare apellido: string;
  declare matricula: string;
  declare especialidad: string | null;
  declare activo: boolean;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
  declare getOperativos: BelongsToManyGetAssociationsMixin<Operativo>;
}

export function VeterinarioModel(sequelize: Sequelize) {
  return sequelize.define<Veterinario>(
    'veterinario',
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      nombre: { type: DataTypes.STRING(100), allowNull: false },
      apellido: { type: DataTypes.STRING(100), allowNull: false },
      matricula: { type: DataTypes.STRING(50), allowNull: false, unique: true },
      especialidad: { type: DataTypes.STRING(150) },
      activo: { type: DataTypes.BOOLEAN, defaultValue: true },
    },
    { tableName: 'veterinarios', timestamps: true }
  );
}

export default Veterinario;
