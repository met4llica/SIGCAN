import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import type Turno from './turno';
import type Veterinario from './veterinario';

export type TipoProcedimiento = 'castracion' | 'chipeo' | 'ambos';

interface ProcedimientoAttributes {
  id: number;
  turnoId: number;
  veterinarioId: number;
  tipo: TipoProcedimiento;
  fecha: Date;
  observaciones: string | null;
}
interface ProcedimientoCreationAttributes extends Optional<ProcedimientoAttributes, 'id' | 'fecha'> {}

class Procedimiento extends Model<ProcedimientoAttributes, ProcedimientoCreationAttributes> implements ProcedimientoAttributes {
  declare id: number;
  declare turnoId: number;
  declare veterinarioId: number;
  declare tipo: TipoProcedimiento;
  declare fecha: Date;
  declare observaciones: string | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
  declare turno?: Turno;
  declare veterinario?: Veterinario;
}

export function ProcedimientoModel(sequelize: Sequelize) {
  return sequelize.define<Procedimiento>(
    'procedimiento',
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      turnoId: { type: DataTypes.INTEGER, allowNull: false, unique: true },
      veterinarioId: { type: DataTypes.INTEGER, allowNull: false },
      tipo: { type: DataTypes.ENUM('castracion', 'chipeo', 'ambos'), allowNull: false },
      fecha: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      observaciones: { type: DataTypes.TEXT },
    },
    { tableName: 'procedimientos', timestamps: true }
  );
}

export default Procedimiento;
