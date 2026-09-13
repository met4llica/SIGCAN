import { Sequelize, DataTypes, Model, Optional, BelongsToManyGetAssociationsMixin } from 'sequelize';
import type Operativo from './operativo';

interface VoluntarioAttributes {
  id: number;
  nombre: string;
  apellido: string;
  telefono: string | null;
  disponibilidad: string | null;
}
interface VoluntarioCreationAttributes extends Optional<VoluntarioAttributes, 'id'> {}

class Voluntario extends Model<VoluntarioAttributes, VoluntarioCreationAttributes> implements VoluntarioAttributes {
  declare id: number;
  declare nombre: string;
  declare apellido: string;
  declare telefono: string | null;
  declare disponibilidad: string | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
  declare getOperativos: BelongsToManyGetAssociationsMixin<Operativo>;
}

export function VoluntarioModel(sequelize: Sequelize) {
  return sequelize.define<Voluntario>(
    'voluntario',
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      nombre: { type: DataTypes.STRING(100), allowNull: false },
      apellido: { type: DataTypes.STRING(100), allowNull: false },
      telefono: { type: DataTypes.STRING(50) },
      disponibilidad: { type: DataTypes.STRING(255) },
    },
    { tableName: 'voluntarios', timestamps: true }
  );
}

export default Voluntario;
