import {
	IDatabaseCollections,
	DatabaseType,
} from './';

import {
	UserSettings,
} from "n8n-core";

import {
	ConnectionOptions,
	createConnection,
	getRepository,
} from "typeorm";

import * as config from 'config';


import {
	MongoDb,
	SQLite,
} from './databases';

export let collections: IDatabaseCollections = {
	Credentials: null,
	Execution: null,
	Workflow: null,
};

import * as path from 'path';

export async function init(): Promise<IDatabaseCollections> {
	const dbType = config.get('database.type') as DatabaseType;
	const n8nFolder = UserSettings.getUserN8nFolderPath();

	let entities;
	let connectionOptions: ConnectionOptions;

	if (dbType === 'mongodb') {
		entities = MongoDb;
		connectionOptions = {
			type: 'mongodb',
			url: config.get('database.mongodbConfig.url') as string,
			useNewUrlParser: true,
		};
	} else if (dbType === 'sqlite') {
		entities = SQLite;
		connectionOptions = {
			type: 'sqlite',
			database: path.join(n8nFolder, 'database.sqlite'),
		};
	} else {
		throw new Error(`The database "${dbType}" is currently not supported!`);
	}

	Object.assign(connectionOptions, {
		entities: Object.values(entities),
		synchronize: true,
		logging: false
	});

	await createConnection(connectionOptions);

	// TODO: Fix that properly
	// @ts-ignore
	collections.Credentials = getRepository(entities.CredentialsEntity);
	// @ts-ignore
	collections.Execution = getRepository(entities.ExecutionEntity);
	// @ts-ignore
	collections.Workflow = getRepository(entities.WorkflowEntity);

	return collections;
}
