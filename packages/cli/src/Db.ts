import {
	DatabaseType,
	GenericHelpers,
	IDatabaseCollections,
} from './';

import {
	UserSettings,
} from 'n8n-core';

import {
	ConnectionOptions,
	createConnection,
	getRepository,
} from 'typeorm';

import {
	MongoDb,
	MySQLDb,
	PostgresDb,
	SQLite,
} from './databases';

export let collections: IDatabaseCollections = {
	Credentials: null,
	Execution: null,
	Workflow: null,
};

import {
	InitialMigration1587669153312
} from './databases/postgresdb/migrations';

import {
	InitialMigration1588157391238
} from './databases/mysqldb/migrations';

import {
	InitialMigration1588102412422
} from './databases/sqlite/migrations';

import * as path from 'path';

export async function init(): Promise<IDatabaseCollections> {
	const dbType = await GenericHelpers.getConfigValue('database.type') as DatabaseType;
	const n8nFolder = UserSettings.getUserN8nFolderPath();

	let entities;
	let connectionOptions: ConnectionOptions;

	switch (dbType) {
		case 'mongodb':
			entities = MongoDb;
			connectionOptions = {
				type: 'mongodb',
				entityPrefix: await GenericHelpers.getConfigValue('database.tablePrefix') as string,
				url: await GenericHelpers.getConfigValue('database.mongodb.connectionUrl') as string,
				useNewUrlParser: true,
			};
			break;

		case 'postgresdb':
			entities = PostgresDb;
			connectionOptions = {
				type: 'postgres',
				entityPrefix: await GenericHelpers.getConfigValue('database.tablePrefix') as string,
				database: await GenericHelpers.getConfigValue('database.postgresdb.database') as string,
				host: await GenericHelpers.getConfigValue('database.postgresdb.host') as string,
				password: await GenericHelpers.getConfigValue('database.postgresdb.password') as string,
				port: await GenericHelpers.getConfigValue('database.postgresdb.port') as number,
				username: await GenericHelpers.getConfigValue('database.postgresdb.user') as string,
				schema: await GenericHelpers.getConfigValue('database.postgresdb.schema') as string,
				migrations: [InitialMigration1587669153312],
				migrationsRun: true
			};
			break;

		case 'mariadb':
		case 'mysqldb':
			entities = MySQLDb;
			connectionOptions = {
				type: dbType === 'mysqldb' ? 'mysql' : 'mariadb',
				database: await GenericHelpers.getConfigValue('database.mysqldb.database') as string,
				entityPrefix: await GenericHelpers.getConfigValue('database.tablePrefix') as string,
				host: await GenericHelpers.getConfigValue('database.mysqldb.host') as string,
				password: await GenericHelpers.getConfigValue('database.mysqldb.password') as string,
				port: await GenericHelpers.getConfigValue('database.mysqldb.port') as number,
				username: await GenericHelpers.getConfigValue('database.mysqldb.user') as string,
				migrations: [InitialMigration1588157391238],
				migrationsRun: true
			};
			break;

		case 'sqlite':
			entities = SQLite;
			connectionOptions = {
				type: 'sqlite',
				database:  path.join(n8nFolder, 'database.sqlite'),
				entityPrefix: await GenericHelpers.getConfigValue('database.tablePrefix') as string,
				migrations: [InitialMigration1588102412422],
				migrationsRun: true,
			};
			break;

		default:
			throw new Error(`The database "${dbType}" is currently not supported!`);
	}

	Object.assign(connectionOptions, {
		entities: Object.values(entities),
		synchronize: false,
		logging: false,
	});

	const connection = await createConnection(connectionOptions);

	await connection.runMigrations({
		transaction: 'none',
	});

	collections.Credentials = getRepository(entities.CredentialsEntity);
	collections.Execution = getRepository(entities.ExecutionEntity);
	collections.Workflow = getRepository(entities.WorkflowEntity);

	return collections;
}
