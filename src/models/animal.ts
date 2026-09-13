import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import type Vecino from './vecino';

export type CondicionAnimal = 'con_tutor' | 'callejero';

interface AnimalAttributes {
  id: number;
  nombre: string;
  especie: string;
  raza: string | null;
  sexo: 'macho' | 'hembra';
  edadEstimada: number | null;
  condicion: CondicionAnimal;
  vecinoId: number | null;
}
interface AnimalCreationAttributes extends Optional<AnimalAttributes, 'id' | 'especie'> {}

class Animal extends Model<AnimalAttributes, AnimalCreationAttributes> implements AnimalAttributes {
  declare id: number;
  declare nombre: string;
  declare especie: string;
  declare raza: string | null;
  declare sexo: 'macho' | 'hembra';
  declare edadEstimada: number | null;
  declare condicion: CondicionAnimal;
  declare vecinoId: number | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
  declare vecino?: Vecino;
}

export function AnimalModel(sequelize: Sequelize) {
  return sequelize.define<Animal>(
    'animal',
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      nombre: { type: DataTypes.STRING(100), allowNull: false },
      especie: { type: DataTypes.STRING(50), allowNull: false, defaultValue: 'canino' },
      raza: { type: DataTypes.STRING(100) },
      sexo: { type: DataTypes.ENUM('macho', 'hembra'), allowNull: false },
      edadEstimada: { type: DataTypes.INTEGER, validate: { min: 0 } },
      condicion: { type: DataTypes.ENUM('con_tutor', 'callejero'), allowNull: false, defaultValue: 'con_tutor' },
      vecinoId: { type: DataTypes.INTEGER, allowNull: true },
    },
    { tableName: 'animales', timestamps: true }
  );
}

export default Animal;
