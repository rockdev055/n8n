import { INodeTypeDescription } from "n8n-workflow";

/**
 * Options to be displayed
 */
export const nodeDescription: INodeTypeDescription = {
	displayName: "MongoDB",
	name: "mongoDb",
	icon: "file:mongoDb.png",
	group: ["input"],
	version: 1,
	description: "Find, insert and update documents in MongoDB.",
	defaults: {
		name: "MongoDB",
		color: "#13AA52",
	},
	inputs: ["main"],
	outputs: ["main"],
	credentials: [
		{
			name: "mongoDb",
			required: true,
		},
	],
	properties: [
		{
			displayName: "Override conn string",
			name: "shouldOverrideConnString",
			type: "boolean",
			default: false,
			description:
				"Whether to override the generated connection string. Credentials will also be ignored in this case.",
		},
		{
			displayName: "Conn string",
			name: "connStringOverrideVal",
			type: "string",
			typeOptions: {
				rows: 1,
			},
			displayOptions: {
				show: {
					shouldOverrideConnString: [true],
				},
			},
			default: "",
			placeholder: `mongodb://USERNAMEHERE:PASSWORDHERE@localhost:27017/?authSource=admin&readPreference=primary&appname=n8n&ssl=false`,
			required: false,
			description: `If "Override conn string" is checked, the value here will be used as a MongoDB connection string, and the MongoDB credentials will be ignored`,
		},
		{
			displayName: "Operation",
			name: "operation",
			type: "options",
			options: [
				{
					name: "Find",
					value: "find",
					description: "Find documents.",
				},
				{
					name: "Insert",
					value: "insert",
					description: "Insert documents.",
				},
				{
					name: "Update",
					value: "update",
					description: "Updates documents.",
				},
			],
			default: "find",
			description: "The operation to perform.",
		},

		{
			displayName: "Collection",
			name: "collection",
			type: "string",
			required: true,
			default: "",
			description: "MongoDB Collection",
		},

		// ----------------------------------
		//         find
		// ----------------------------------
		{
			displayName: "Query (JSON format)",
			name: "query",
			type: "string",
			typeOptions: {
				rows: 5,
			},
			displayOptions: {
				show: {
					operation: ["find"],
				},
			},
			default: "{}",
			placeholder: `{ "birth": { "$gt": "1950-01-01" } }`,
			required: true,
			description: "MongoDB Find query.",
		},

		// ----------------------------------
		//         insert
		// ----------------------------------
		{
			displayName: "Fields",
			name: "fields",
			type: "string",
			displayOptions: {
				show: {
					operation: ["insert"],
				},
			},
			default: "",
			placeholder: "name,description",
			description:
				"Comma separated list of the fields to be included into the new document.",
		},

		// ----------------------------------
		//         update
		// ----------------------------------
		{
			displayName: "Update Key",
			name: "updateKey",
			type: "string",
			displayOptions: {
				show: {
					operation: ["update"],
				},
			},
			default: "id",
			required: true,
			description:
				'Name of the property which decides which rows in the database should be updated. Normally that would be "id".',
		},
		{
			displayName: "Fields",
			name: "fields",
			type: "string",
			displayOptions: {
				show: {
					operation: ["update"],
				},
			},
			default: "",
			placeholder: "name,description",
			description:
				"Comma separated list of the fields to be included into the new document.",
		},
	],
};
