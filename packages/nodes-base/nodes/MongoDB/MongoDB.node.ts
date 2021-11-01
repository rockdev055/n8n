import { IExecuteFunctions } from 'n8n-core';
import {
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';

import { MongoClient } from 'mongodb';


/**
 * Returns of copy of the items which only contains the json data and
 * of that only the define properties
 *
 * @param {INodeExecutionData[]} items The items to copy
 * @param {string[]} properties The properties it should include
 * @returns
 */
function getItemCopy(items: INodeExecutionData[], properties: string[]): IDataObject[] {
	// Prepare the data to insert and copy it to be returned
	let newItem: IDataObject;
	return items.map((item) => {
		newItem = {};
		for (const property of properties) {
			if (item.json[property] === undefined) {
				newItem[property] = null;
			} else {
				newItem[property] = JSON.parse(JSON.stringify(item.json[property]));
			}
		}
		return newItem;
	});
}


export class MongoDB implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'MongoDB',
		name: 'mongodb',
		icon: 'file:mongodb.png',
		group: ['input'],
		version: 1,
		description: 'Find, insert and update documents in MongoDB.',
		defaults: {
			name: 'MongoDB',
			color: '#13AA52',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'mongodb',
				required: true,
			}
		],
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				options: [
					{
						name: 'Find',
						value: 'find',
						description: 'Find documents.',
					},
					{
						name: 'Insert',
						value: 'insert',
						description: 'Insert documents.',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Updates documents.',
					},
				],
				default: 'find',
				description: 'The operation to perform.',
			},

			{
				displayName: 'Collection',
				name: 'collection',
				type: 'string',
				required: true,
				default: '',
				description: 'MongoDB Collection'
			},

			// ----------------------------------
			//         find
			// ----------------------------------
			{
				displayName: 'Query (JSON format)',
				name: 'query',
				type: 'string',
				typeOptions: {
					rows: 5,
				},
				displayOptions: {
					show: {
						operation: [
							'find'
						],
					},
				},
				default: '{}',
				placeholder: `{ "birth": { "$gt": "1950-01-01" } }`,
				required: true,
				description: 'MongoDB Find query.',
			},


			// ----------------------------------
			//         insert
			// ----------------------------------
			{
				displayName: 'Table',
				name: 'table',
				type: 'string',
				displayOptions: {
					show: {
						operation: [
							'insert'
						],
					},
				},
				default: '',
				required: true,
				description: 'Name of the table in which to insert data to.',
			},
			{
				displayName: 'Columns',
				name: 'columns',
				type: 'string',
				displayOptions: {
					show: {
						operation: [
							'insert'
						],
					},
				},
				default: '',
				placeholder: 'id,name,description',
				description: 'Comma separated list of the properties which should used as columns for the new rows.',
			},


			// ----------------------------------
			//         update
			// ----------------------------------
			{
				displayName: 'Table',
				name: 'table',
				type: 'string',
				displayOptions: {
					show: {
						operation: [
							'update'
						],
					},
				},
				default: '',
				required: true,
				description: 'Name of the table in which to update data in',
			},
			{
				displayName: 'Update Key',
				name: 'updateKey',
				type: 'string',
				displayOptions: {
					show: {
						operation: [
							'update'
						],
					},
				},
				default: 'id',
				required: true,
				description: 'Name of the property which decides which rows in the database should be updated. Normally that would be "id".',
			},
			{
				displayName: 'Columns',
				name: 'columns',
				type: 'string',
				displayOptions: {
					show: {
						operation: [
							'update'
						],
					},
				},
				default: '',
				placeholder: 'name,description',
				description: 'Comma separated list of the properties which should used as columns for rows to update.',
			},

		]
	};


	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {

		const credentials = this.getCredentials('mongodb');

		if (credentials === undefined) {
			throw new Error('No credentials got returned!');
		}

		let connectionUri = ''

		if (credentials.port) {
		  connectionUri = `mongodb://${credentials.user}:${credentials.password}@${credentials.host}:${credentials.port}`
    } else {
      connectionUri = `mongodb+srv://${credentials.user}:${credentials.password}@${credentials.host}`
    }

		const client = await MongoClient.connect(connectionUri, { useNewUrlParser: true, useUnifiedTopology: true });
		const mdb = client.db(credentials.database as string);

		let returnItems = [];

		const items = this.getInputData();
		const operation = this.getNodeParameter('operation', 0) as string;

		if (operation === 'find') {
			// ----------------------------------
			//         find
			// ----------------------------------

			const queryResult = await mdb
				.collection(this.getNodeParameter('collection', 0) as string)
				.find(JSON.parse(this.getNodeParameter('query', 0) as string))
				.toArray();

			returnItems = this.helpers.returnJsonArray(queryResult as IDataObject[]);

		// } else if (operation === 'insert') {
			// ----------------------------------
			//         insert
			// ----------------------------------

			// const table = this.getNodeParameter('table', 0) as string;
			// const columnString = this.getNodeParameter('columns', 0) as string;

			// const columns = columnString.split(',').map(column => column.trim());

			// const cs = new pgp.helpers.ColumnSet(columns, { table });

			// // Prepare the data to insert and copy it to be returned
			// const insertItems = getItemCopy(items, columns);

			// // Generate the multi-row insert query and return the id of new row
			// const query = pgp.helpers.insert(insertItems, cs) + ' RETURNING id';

			// // Executing the query to insert the data
			// const insertData = await db.many(query);

			// // Add the id to the data
			// for (let i = 0; i < insertData.length; i++) {
			// 	returnItems.push({
			// 		json: {
			// 			...insertData[i],
			// 			...insertItems[i],
			// 		}
			// 	});
			// }

		// } else if (operation === 'update') {
			// ----------------------------------
			//         update
			// ----------------------------------

			// const table = this.getNodeParameter('table', 0) as string;
			// const updateKey = this.getNodeParameter('updateKey', 0) as string;
			// const columnString = this.getNodeParameter('columns', 0) as string;

			// const columns = columnString.split(',').map(column => column.trim());

			// // Make sure that the updateKey does also get queried
			// if (!columns.includes(updateKey)) {
			// 	columns.unshift(updateKey);
			// }

			// // Prepare the data to update and copy it to be returned
			// const updateItems = getItemCopy(items, columns);

			// // Generate the multi-row update query
			// const query = pgp.helpers.update(updateItems, columns, table) + ' WHERE v.' + updateKey + ' = t.' + updateKey;

			// // Executing the query to update the data
			// await db.none(query);

			// returnItems = this.helpers.returnJsonArray(updateItems	 as IDataObject[]);

		} else {
			throw new Error(`The operation "${operation}" is not supported!`);
		}

		return this.prepareOutputData(returnItems);
	}
}
