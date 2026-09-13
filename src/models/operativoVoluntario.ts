import { Sequelize, DataTypes, Model, Optional } from 'sequelize';

interface OperativoVoluntarioAttributes {
  id: number;
  operativoId: number;
  voluntarioId: number;
}
interface OperativoVoluntarioCreationAttributes extends Optional<OperativoVoluntarioAttributes, 'id'> {}

class OperativoVoluntario
  extends Model<OperativoVoluntarioAttributes, OperativoVoluntarioCreationAttributes>
  implements OperativoVoluntarioAttributes
{
  declare id: number;
  declare operativoId: number;
  declare voluntarioId: number;
}

export function OperativoVoluntarioModel(sequelize: Sequelize) {
  return sequelize.define<OperativoVoluntario>(
    'operativoVoluntario',
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      operativoId: { type: DataTypes.INTEGER, allowNull: false },
      voluntarioId: { type: DataTypes.INTEGER, allowNull: false },
    },
    { tableName: 'operativo_voluntarios', timestamps: false }
  );
}

export default OperativoVoluntario;
