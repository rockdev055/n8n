import { INodeProperties } from "n8n-workflow";

export const tableOperations = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		displayOptions: {
			show: {
				resource: [
					'table',
				],
			},
		},
		options: [
			{
				name: 'Add Row',
				value: 'addRow',
				description: 'Adds rows to the end of the table'
			},
			{
				name: 'Get Columns',
				value: 'getColumns',
				description: 'Retrieve a list of tablecolumns',
			},
			{
				name: 'Get Rows',
				value: 'getRows',
				description: 'Retrieve a list of tablerows',
			},
		],
		default: 'addRow',
		description: 'The operation to perform.',
	},
] as INodeProperties[];

export const tableFields = [

/* -------------------------------------------------------------------------- */
/*                                 table:addRow                               */
/* -------------------------------------------------------------------------- */
	{
		displayName: 'Workbook',
		name: 'workbook',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getWorkbooks',
		},
		displayOptions: {
			show: {
				operation: [
					'addRow',
				],
				resource: [
					'table',
				],
			},
		},
		default: '',
	},
	{
		displayName: 'Worksheet',
		name: 'worksheet',
		type: 'options',
		required: true,
		typeOptions: {
			loadOptionsMethod: 'getworksheets',
			loadOptionsDependsOn: [
				'workbook',
			],
		},
		displayOptions: {
			show: {
				operation: [
					'addRow',
				],
				resource: [
					'table',
				],
			},
		},
		default: '',
	},
	{
		displayName: 'Table',
		name: 'table',
		type: 'options',
		required: true,
		typeOptions: {
			loadOptionsMethod: 'getTables',
			loadOptionsDependsOn: [
				'worksheet',
			],
		},
		displayOptions: {
			show: {
				operation: [
					'addRow',
				],
				resource: [
					'table',
				],
			},
		},
		default: '',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				operation: [
					'addRow',
				],
				resource: [
					'table',
				],
			},
		},
		options: [
			{
				displayName: 'Index',
				name: 'index',
				type: 'number',
				default: 0,
				typeOptions: {
					minValue: 0,
				},
				description: `Specifies the relative position of the new row. If not defined,</br>
				 the addition happens at the end. Any rows below the inserted row are shifted downwards. Zero-indexed`,
			},
		],
	},
/* -------------------------------------------------------------------------- */
/*                                 table:getRows                              */
/* -------------------------------------------------------------------------- */
	{
		displayName: 'Workbook',
		name: 'workbook',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getWorkbooks',
		},
		displayOptions: {
			show: {
				operation: [
					'getRows',
				],
				resource: [
					'table',
				],
			},
		},
		default: '',
	},
	{
		displayName: 'Worksheet',
		name: 'worksheet',
		type: 'options',
		required: true,
		typeOptions: {
			loadOptionsMethod: 'getworksheets',
			loadOptionsDependsOn: [
				'workbook',
			],
		},
		displayOptions: {
			show: {
				operation: [
					'getRows',
				],
				resource: [
					'table',
				],
			},
		},
		default: '',
	},
	{
		displayName: 'Table',
		name: 'table',
		type: 'options',
		required: true,
		typeOptions: {
			loadOptionsMethod: 'getTables',
			loadOptionsDependsOn: [
				'worksheet',
			],
		},
		displayOptions: {
			show: {
				operation: [
					'getRows',
				],
				resource: [
					'table',
				],
			},
		},
		default: '',
	},
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				operation: [
					'getRows',
				],
				resource: [
					'table',
				],
			},
		},
		default: false,
		description: 'If all results should be returned or only up to a given limit.',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		displayOptions: {
			show: {
				operation: [
					'getRows',
				],
				resource: [
					'table',
				],
				returnAll: [
					false,
				],
			},
		},
		typeOptions: {
			minValue: 1,
			maxValue: 500,
		},
		default: 100,
		description: 'How many results to return.',
	},
	{
		displayName: 'RAW Data',
		name: 'rawData',
		type: 'boolean',
		displayOptions: {
			show: {
				operation: [
					'getRows',
				],
				resource: [
					'table',
				],
			},
		},
		default: false,
		description: 'If the data should be returned RAW instead of parsed into keys according to their header.',
	},
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				operation: [
					'getRows',
				],
				resource: [
					'table',
				],
				rawData: [
					true,
				],
			},
		},
		options: [
			{
				displayName: 'Fields',
				name: 'fields',
				type: 'string',
				default: '',
				description: `Fields the response will containt. Multiple can be added separated by ,.`,
			},
		]
	},
/* -------------------------------------------------------------------------- */
/*                                 table:getColumns                           */
/* -------------------------------------------------------------------------- */
	{
		displayName: 'Workbook',
		name: 'workbook',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getWorkbooks',
		},
		displayOptions: {
			show: {
				operation: [
					'getColumns',
				],
				resource: [
					'table',
				],
			},
		},
		default: '',
	},
	{
		displayName: 'Worksheet',
		name: 'worksheet',
		type: 'options',
		required: true,
		typeOptions: {
			loadOptionsMethod: 'getworksheets',
			loadOptionsDependsOn: [
				'workbook',
			],
		},
		displayOptions: {
			show: {
				operation: [
					'getColumns',
				],
				resource: [
					'table',
				],
			},
		},
		default: '',
	},
	{
		displayName: 'Table',
		name: 'table',
		type: 'options',
		required: true,
		typeOptions: {
			loadOptionsMethod: 'getTables',
			loadOptionsDependsOn: [
				'worksheet',
			],
		},
		displayOptions: {
			show: {
				operation: [
					'getColumns',
				],
				resource: [
					'table',
				],
			},
		},
		default: '',
	},
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				operation: [
					'getColumns',
				],
				resource: [
					'table',
				],
			},
		},
		default: false,
		description: 'If all results should be returned or only up to a given limit.',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		displayOptions: {
			show: {
				operation: [
					'getColumns',
				],
				resource: [
					'table',
				],
				returnAll: [
					false,
				],
			},
		},
		typeOptions: {
			minValue: 1,
			maxValue: 500,
		},
		default: 100,
		description: 'How many results to return.',
	},
	{
		displayName: 'RAW Data',
		name: 'rawData',
		type: 'boolean',
		displayOptions: {
			show: {
				operation: [
					'getColumns',
				],
				resource: [
					'table',
				],
			},
		},
		default: false,
		description: 'If the data should be returned RAW instead of parsed into keys according to their header.',
	},
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				operation: [
					'getColumns',
				],
				resource: [
					'table',
				],
				rawData: [
					true
				],
			},
		},
		options: [
			{
				displayName: 'Fields',
				name: 'fields',
				type: 'string',
				default: '',
				description: `Fields the response will containt. Multiple can be added separated by ,.`,
			},
		]
	},
] as INodeProperties[];
