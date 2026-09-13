import { Sequelize, DataTypes, Model, Optional } from 'sequelize';

interface VecinoAttributes {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
  telefono: string | null;
  email: string | null;
  direccion: string | null;
  zonaId: number | null;
}
interface VecinoCreationAttributes extends Optional<VecinoAttributes, 'id'> {}

class Vecino extends Model<VecinoAttributes, VecinoCreationAttributes> implements VecinoAttributes {
  declare id: number;
  declare nombre: string;
  declare apellido: string;
  declare dni: string;
  declare telefono: string | null;
  declare email: string | null;
  declare direccion: string | null;
  declare zonaId: number | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

export function VecinoModel(sequelize: Sequelize) {
  return sequelize.define<Vecino>(
    'vecino',
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      nombre: { type: DataTypes.STRING(100), allowNull: false },
      apellido: { type: DataTypes.STRING(100), allowNull: false },
      dni: { type: DataTypes.STRING(20), allowNull: false, unique: true },
      telefono: { type: DataTypes.STRING(50) },
      email: { type: DataTypes.STRING(150), validate: { isEmail: true } },
      direccion: { type: DataTypes.STRING(255) },
      zonaId: { type: DataTypes.INTEGER, allowNull: true },
    },
    { tableName: 'vecinos', timestamps: true }
  );
}

export default Vecino;
