import { Sequelize, DataTypes, Model, Optional } from 'sequelize';

interface ProcedimientoInsumoAttributes {
  id: number;
  procedimientoId: number;
  insumoId: number;
  cantidadUsada: number;
}
interface ProcedimientoInsumoCreationAttributes extends Optional<ProcedimientoInsumoAttributes, 'id'> {}

class ProcedimientoInsumo
  extends Model<ProcedimientoInsumoAttributes, ProcedimientoInsumoCreationAttributes>
  implements ProcedimientoInsumoAttributes
{
  declare id: number;
  declare procedimientoId: number;
  declare insumoId: number;
  declare cantidadUsada: number;
}

export function ProcedimientoInsumoModel(sequelize: Sequelize) {
  return sequelize.define<ProcedimientoInsumo>(
    'procedimientoInsumo',
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      procedimientoId: { type: DataTypes.INTEGER, allowNull: false },
      insumoId: { type: DataTypes.INTEGER, allowNull: false },
      cantidadUsada: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1 } },
    },
    { tableName: 'procedimiento_insumos', timestamps: false }
  );
}

export default ProcedimientoInsumo;
