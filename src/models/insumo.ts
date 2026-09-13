import { Sequelize, DataTypes, Model, Optional } from 'sequelize';

interface InsumoAttributes {
  id: number;
  nombre: string;
  unidad: string;
  stock: number;
}
interface InsumoCreationAttributes extends Optional<InsumoAttributes, 'id' | 'stock'> {}

class Insumo extends Model<InsumoAttributes, InsumoCreationAttributes> implements InsumoAttributes {
  declare id: number;
  declare nombre: string;
  declare unidad: string;
  declare stock: number;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

export function InsumoModel(sequelize: Sequelize) {
  return sequelize.define<Insumo>(
    'insumo',
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      nombre: { type: DataTypes.STRING(150), allowNull: false, unique: true },
      unidad: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'unidad' },
      stock: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, validate: { min: 0 } },
    },
    { tableName: 'insumos', timestamps: true }
  );
}

export default Insumo;
