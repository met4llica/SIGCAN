// Node-only: sync de schema + seed del admin. Solo lo importa instrumentation.ts
// (nunca middleware.ts, que corre en el Edge runtime y no soporta Sequelize/pg).
export async function initDatabase() {
  const { sequelize, Usuario } = await import('@/lib/db');
  try {
    await sequelize.authenticate();
    console.log('[DB] Conexión establecida con PostgreSQL');

    await sequelize.sync({ force: false, alter: true });
    console.log('[DB] Modelos sincronizados');

    const adminEmail = 'admin@sigcan-zoonosis.local';
    const adminExistente = await Usuario.findOne({ where: { email: adminEmail } });
    if (!adminExistente) {
      const bcrypt = require('bcryptjs');
      const hash = await bcrypt.hash('admin123', 10);
      await Usuario.create({
        nombre: 'Admin',
        apellido: 'Zoonosis',
        email: adminEmail,
        password: hash,
        rol: 'admin',
        activo: true,
      });
      console.log('[DB] Usuario admin creado:', adminEmail, '/ admin123');
    } else {
      console.log('[DB] Usuario admin ya existe');
    }
  } catch (err) {
    console.error('[DB] Error inicializando:', err);
    throw err;
  }
}
