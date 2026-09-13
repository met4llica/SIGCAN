import { Sequelize } from 'sequelize';
import { ZonaModel } from '../models/zona';
import { VecinoModel } from '../models/vecino';
import { AnimalModel } from '../models/animal';
import { VeterinarioModel } from '../models/veterinario';
import { InsumoModel } from '../models/insumo';
import { OperativoModel } from '../models/operativo';
import { TurnoModel } from '../models/turno';
import { ProcedimientoModel } from '../models/procedimiento';
import { ProcedimientoInsumoModel } from '../models/procedimientoInsumo';
import { HistorialClinicoModel } from '../models/historialClinico';
import { ReporteAvistamientoModel } from '../models/reporteAvistamiento';
import { UsuarioModel } from '../models/usuario';
import { NotificacionModel } from '../models/notificacion';
import { VoluntarioModel } from '../models/voluntario';
import { OperativoVoluntarioModel } from '../models/operativoVoluntario';

const sequelize = new Sequelize(
  process.env.DATABASE_URL ||
    `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
  {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    },
  }
);

const Zona = ZonaModel(sequelize);
const Vecino = VecinoModel(sequelize);
const Animal = AnimalModel(sequelize);
const Veterinario = VeterinarioModel(sequelize);
const Insumo = InsumoModel(sequelize);
const Operativo = OperativoModel(sequelize);
const Turno = TurnoModel(sequelize);
const Procedimiento = ProcedimientoModel(sequelize);
const ProcedimientoInsumo = ProcedimientoInsumoModel(sequelize);
const HistorialClinico = HistorialClinicoModel(sequelize);
const ReporteAvistamiento = ReporteAvistamientoModel(sequelize);
const Usuario = UsuarioModel(sequelize);
const Notificacion = NotificacionModel(sequelize);
const Voluntario = VoluntarioModel(sequelize);
const OperativoVoluntario = OperativoVoluntarioModel(sequelize);

// === ASOCIACIONES ===

// Zona
Zona.hasMany(Vecino, { foreignKey: 'zonaId', as: 'vecinos' });
Vecino.belongsTo(Zona, { foreignKey: 'zonaId', as: 'zona' });
Zona.hasMany(Operativo, { foreignKey: 'zonaId', as: 'operativos' });
Operativo.belongsTo(Zona, { foreignKey: 'zonaId', as: 'zona' });
Zona.hasMany(ReporteAvistamiento, { foreignKey: 'zonaId', as: 'reportes' });
ReporteAvistamiento.belongsTo(Zona, { foreignKey: 'zonaId', as: 'zona' });

// Vecino <-> Animal (tutor)
Vecino.hasMany(Animal, { foreignKey: 'vecinoId', as: 'animales' });
Animal.belongsTo(Vecino, { foreignKey: 'vecinoId', as: 'vecino' });

// Vecino <-> ReporteAvistamiento (reportante)
Vecino.hasMany(ReporteAvistamiento, { foreignKey: 'vecinoId', as: 'reportesRealizados' });
ReporteAvistamiento.belongsTo(Vecino, { foreignKey: 'vecinoId', as: 'vecino' });

// Animal <-> Turno
Animal.hasMany(Turno, { foreignKey: 'animalId', as: 'turnos' });
Turno.belongsTo(Animal, { foreignKey: 'animalId', as: 'animal' });

// Operativo <-> Turno
Operativo.hasMany(Turno, { foreignKey: 'operativoId', as: 'turnos' });
Turno.belongsTo(Operativo, { foreignKey: 'operativoId', as: 'operativo' });

// Operativo <-> Veterinario (M2M)
Operativo.belongsToMany(Veterinario, { through: 'operativoVeterinario', as: 'veterinarios' });
Veterinario.belongsToMany(Operativo, { through: 'operativoVeterinario', as: 'operativos' });

// Operativo <-> Voluntario (M2M)
Operativo.belongsToMany(Voluntario, { through: OperativoVoluntario, foreignKey: 'operativoId', otherKey: 'voluntarioId', as: 'voluntarios' });
Voluntario.belongsToMany(Operativo, { through: OperativoVoluntario, foreignKey: 'voluntarioId', otherKey: 'operativoId', as: 'operativos' });

// Turno <-> Procedimiento (1 a 1)
Turno.hasOne(Procedimiento, { foreignKey: 'turnoId', as: 'procedimiento' });
Procedimiento.belongsTo(Turno, { foreignKey: 'turnoId', as: 'turno' });

// Veterinario <-> Procedimiento
Veterinario.hasMany(Procedimiento, { foreignKey: 'veterinarioId', as: 'procedimientos' });
Procedimiento.belongsTo(Veterinario, { foreignKey: 'veterinarioId', as: 'veterinario' });

// Procedimiento <-> Insumo (M2M con cantidad)
Procedimiento.belongsToMany(Insumo, { through: ProcedimientoInsumo, foreignKey: 'procedimientoId', otherKey: 'insumoId', as: 'insumos' });
Insumo.belongsToMany(Procedimiento, { through: ProcedimientoInsumo, foreignKey: 'insumoId', otherKey: 'procedimientoId', as: 'procedimientos' });

// Animal <-> HistorialClinico
Animal.hasMany(HistorialClinico, { foreignKey: 'animalId', as: 'historial' });
HistorialClinico.belongsTo(Animal, { foreignKey: 'animalId', as: 'animal' });

// Procedimiento <-> HistorialClinico
Procedimiento.hasOne(HistorialClinico, { foreignKey: 'procedimientoId', as: 'historial' });
HistorialClinico.belongsTo(Procedimiento, { foreignKey: 'procedimientoId', as: 'procedimiento' });

// Turno <-> Notificacion
Turno.hasMany(Notificacion, { foreignKey: 'turnoId', as: 'notificaciones' });
Notificacion.belongsTo(Turno, { foreignKey: 'turnoId', as: 'turno' });

export {
  sequelize,
  Zona,
  Vecino,
  Animal,
  Veterinario,
  Insumo,
  Operativo,
  Turno,
  Procedimiento,
  ProcedimientoInsumo,
  HistorialClinico,
  ReporteAvistamiento,
  Usuario,
  Notificacion,
  Voluntario,
  OperativoVoluntario,
};
