import { Sequelize, DataTypes, Model, Optional } from 'sequelize';

export type UserRole = 'admin' | 'operador' | 'veterinario';

interface UsuarioAttributes {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  rol: UserRole;
  activo: boolean;
}
interface UsuarioCreationAttributes extends Optional<UsuarioAttributes, 'id' | 'activo'> {}

class Usuario extends Model<UsuarioAttributes, UsuarioCreationAttributes> implements UsuarioAttributes {
  declare id: number;
  declare nombre: string;
  declare apellido: string;
  declare email: string;
  declare password: string;
  declare rol: UserRole;
  declare activo: boolean;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

export function UsuarioModel(sequelize: Sequelize) {
  return sequelize.define<Usuario>(
    'usuario',
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      nombre: { type: DataTypes.STRING(100), allowNull: false },
      apellido: { type: DataTypes.STRING(100), allowNull: false },
      email: { type: DataTypes.STRING(150), allowNull: false, unique: true, validate: { isEmail: true } },
      password: { type: DataTypes.STRING(255), allowNull: false },
      rol: { type: DataTypes.ENUM('admin', 'operador', 'veterinario'), allowNull: false, defaultValue: 'operador' },
      activo: { type: DataTypes.BOOLEAN, defaultValue: true },
    },
    { tableName: 'usuarios', timestamps: true }
  );
}

export default Usuario;
