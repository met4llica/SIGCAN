import { Sequelize, DataTypes, Model, Optional } from 'sequelize';

export type TipoNotificacion = 'recordatorio' | 'reprogramacion' | 'cancelacion' | 'confirmacion';

interface NotificacionAttributes {
  id: number;
  turnoId: number;
  tipo: TipoNotificacion;
  mensaje: string;
  fechaEnvio: Date;
}
interface NotificacionCreationAttributes extends Optional<NotificacionAttributes, 'id' | 'fechaEnvio'> {}

class Notificacion extends Model<NotificacionAttributes, NotificacionCreationAttributes> implements NotificacionAttributes {
  declare id: number;
  declare turnoId: number;
  declare tipo: TipoNotificacion;
  declare mensaje: string;
  declare fechaEnvio: Date;
  declare readonly createdAt: Date;
}

export function NotificacionModel(sequelize: Sequelize) {
  return sequelize.define<Notificacion>(
    'notificacion',
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      turnoId: { type: DataTypes.INTEGER, allowNull: false },
      tipo: { type: DataTypes.ENUM('recordatorio', 'reprogramacion', 'cancelacion', 'confirmacion'), allowNull: false },
      mensaje: { type: DataTypes.TEXT, allowNull: false },
      fechaEnvio: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    },
    { tableName: 'notificaciones', timestamps: true, updatedAt: false }
  );
}

export default Notificacion;
