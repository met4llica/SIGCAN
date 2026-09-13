import { Sequelize, DataTypes, Model, Optional } from 'sequelize';

interface ZonaAttributes {
  id: number;
  nombre: string;
}
interface ZonaCreationAttributes extends Optional<ZonaAttributes, 'id'> {}

class Zona extends Model<ZonaAttributes, ZonaCreationAttributes> implements ZonaAttributes {
  declare id: number;
  declare nombre: string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

export function ZonaModel(sequelize: Sequelize) {
  return sequelize.define<Zona>(
    'zona',
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      nombre: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    },
    { tableName: 'zonas', timestamps: true }
  );
}

export default Zona;
