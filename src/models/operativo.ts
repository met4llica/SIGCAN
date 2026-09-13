import { Sequelize, DataTypes, Model, Optional, BelongsToManyGetAssociationsMixin, BelongsToManySetAssociationsMixin } from 'sequelize';
import type Veterinario from './veterinario';
import type Zona from './zona';
import type Turno from './turno';

export type EstadoOperativo = 'planificado' | 'en_curso' | 'finalizado' | 'cancelado';

interface OperativoAttributes {
  id: number;
  fecha: Date;
  lugar: string;
  zonaId: number;
  cupoMaximo: number;
  estado: EstadoOperativo;
}
interface OperativoCreationAttributes extends Optional<OperativoAttributes, 'id' | 'estado'> {}

class Operativo extends Model<OperativoAttributes, OperativoCreationAttributes> implements OperativoAttributes {
  declare id: number;
  declare fecha: Date;
  declare lugar: string;
  declare zonaId: number;
  declare cupoMaximo: number;
  declare estado: EstadoOperativo;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
  declare zona?: Zona;
  declare turnos?: Turno[];
  declare getVeterinarios: BelongsToManyGetAssociationsMixin<Veterinario>;
  declare setVeterinarios: BelongsToManySetAssociationsMixin<Veterinario, number>;
}

export function OperativoModel(sequelize: Sequelize) {
  return sequelize.define<Operativo>(
    'operativo',
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      fecha: { type: DataTypes.DATE, allowNull: false },
      lugar: { type: DataTypes.STRING(200), allowNull: false },
      zonaId: { type: DataTypes.INTEGER, allowNull: false },
      cupoMaximo: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1 } },
      estado: {
        type: DataTypes.ENUM('planificado', 'en_curso', 'finalizado', 'cancelado'),
        allowNull: false,
        defaultValue: 'planificado',
      },
    },
    { tableName: 'operativos', timestamps: true }
  );
}

export default Operativo;
