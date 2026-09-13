import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import type Vecino from './vecino';
import type Zona from './zona';

export type EstadoReporte = 'pendiente' | 'atendido';

interface ReporteAvistamientoAttributes {
  id: number;
  vecinoId: number | null;
  zonaId: number;
  descripcion: string;
  fecha: Date;
  estado: EstadoReporte;
}
interface ReporteAvistamientoCreationAttributes extends Optional<ReporteAvistamientoAttributes, 'id' | 'fecha' | 'estado' | 'vecinoId'> {}

class ReporteAvistamiento
  extends Model<ReporteAvistamientoAttributes, ReporteAvistamientoCreationAttributes>
  implements ReporteAvistamientoAttributes
{
  declare id: number;
  declare vecinoId: number | null;
  declare zonaId: number;
  declare descripcion: string;
  declare fecha: Date;
  declare estado: EstadoReporte;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
  declare vecino?: Vecino;
  declare zona?: Zona;
}

export function ReporteAvistamientoModel(sequelize: Sequelize) {
  return sequelize.define<ReporteAvistamiento>(
    'reporteAvistamiento',
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      vecinoId: { type: DataTypes.INTEGER, allowNull: true },
      zonaId: { type: DataTypes.INTEGER, allowNull: false },
      descripcion: { type: DataTypes.TEXT, allowNull: false },
      fecha: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      estado: { type: DataTypes.ENUM('pendiente', 'atendido'), allowNull: false, defaultValue: 'pendiente' },
    },
    { tableName: 'reportes_avistamiento', timestamps: true }
  );
}

export default ReporteAvistamiento;
