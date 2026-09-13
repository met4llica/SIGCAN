import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import type Animal from './animal';
import type Operativo from './operativo';

export type EstadoTurno = 'pendiente' | 'confirmado' | 'completado' | 'cancelado' | 'reprogramado';

export const ESTADOS_TURNO_ACTIVOS: EstadoTurno[] = ['pendiente', 'confirmado', 'reprogramado'];

interface TurnoAttributes {
  id: number;
  animalId: number;
  operativoId: number;
  fecha: Date;
  estado: EstadoTurno;
}
interface TurnoCreationAttributes extends Optional<TurnoAttributes, 'id' | 'estado'> {}

class Turno extends Model<TurnoAttributes, TurnoCreationAttributes> implements TurnoAttributes {
  declare id: number;
  declare animalId: number;
  declare operativoId: number;
  declare fecha: Date;
  declare estado: EstadoTurno;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
  declare animal?: Animal;
  declare operativo?: Operativo;
}

export function TurnoModel(sequelize: Sequelize) {
  return sequelize.define<Turno>(
    'turno',
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      animalId: { type: DataTypes.INTEGER, allowNull: false },
      operativoId: { type: DataTypes.INTEGER, allowNull: false },
      fecha: { type: DataTypes.DATE, allowNull: false },
      estado: {
        type: DataTypes.ENUM('pendiente', 'confirmado', 'completado', 'cancelado', 'reprogramado'),
        allowNull: false,
        defaultValue: 'pendiente',
      },
    },
    { tableName: 'turnos', timestamps: true }
  );
}

export default Turno;
