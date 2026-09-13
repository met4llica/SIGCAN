import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import type Procedimiento from './procedimiento';

interface HistorialClinicoAttributes {
  id: number;
  animalId: number;
  procedimientoId: number;
  fecha: Date;
  descripcion: string;
}
interface HistorialClinicoCreationAttributes extends Optional<HistorialClinicoAttributes, 'id' | 'fecha'> {}

class HistorialClinico
  extends Model<HistorialClinicoAttributes, HistorialClinicoCreationAttributes>
  implements HistorialClinicoAttributes
{
  declare id: number;
  declare animalId: number;
  declare procedimientoId: number;
  declare fecha: Date;
  declare descripcion: string;
  declare readonly createdAt: Date;
  declare procedimiento?: Procedimiento;
}

export function HistorialClinicoModel(sequelize: Sequelize) {
  return sequelize.define<HistorialClinico>(
    'historialClinico',
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      animalId: { type: DataTypes.INTEGER, allowNull: false },
      procedimientoId: { type: DataTypes.INTEGER, allowNull: false },
      fecha: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      descripcion: { type: DataTypes.TEXT, allowNull: false },
    },
    { tableName: 'historial_clinico', timestamps: true, updatedAt: false }
  );
}

export default HistorialClinico;
