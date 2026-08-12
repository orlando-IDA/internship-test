import { config } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';

// O CLI de migration roda fora do contexto do Nest, sem ConfigModule.
// Por isso o .env é carregado explicitamente aqui.
config();

export const dataSourceOptions: DataSourceOptions = {
  type: 'mysql',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT ?? 3306),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,

  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],

  // Nunca deixar o TypeORM alterar o schema sozinho: ele compara entities
  // com o banco e aplica DDL silenciosamente, podendo dropar coluna e dado.
  synchronize: false,

  // Roda as migrations pendentes no boot da aplicação. A tabela `migrations`
  // registra o que já foi aplicado, então subir de novo não recria nada.
  migrationsRun: true,
};

// O CLI do TypeORM exige um DataSource como export default.
export default new DataSource(dataSourceOptions);
