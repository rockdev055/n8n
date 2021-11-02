import {
	INodeProperties,
 } from 'n8n-workflow';

export const taskOperations = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		displayOptions: {
			show: {
				resource: [
					'task',
				],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a task',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a task',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a task',
			},
			{
				name: 'Get all',
				value: 'getAll',
				description: 'Get all tasks',
			},
			{
				name: 'Set custom field',
				value: 'setCustomField',
				description: 'Set a custom field',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a task',
			},
		],
		default: 'create',
		description: 'The operation to perform.',
	},
] as INodeProperties[];

export const taskFields = [

/* -------------------------------------------------------------------------- */
/*                                task:create                                 */
/* -------------------------------------------------------------------------- */
	{
		displayName: 'Team ID',
		name: 'teamId',
		type: 'options',
		default: '',
		displayOptions: {
			show: {
				resource: [
					'task',
				],
				operation: [
					'create',
				],
			},
		},
		typeOptions: {
			loadOptionsMethod: 'getTeams',
		},
		required: true,
	},
	{
		displayName: 'Space ID',
		name: 'spaceId',
		type: 'options',
		default: '',
		displayOptions: {
			show: {
				resource: [
					'task',
				],
				operation: [
					'create',
				],
			},
		},
		typeOptions: {
			loadOptionsMethod: 'getSpaces',
			loadOptionsDependsOn: [
				'teamId',
			]
		},
		required: true,
	},
	{
		displayName: 'Folderless List',
		name: 'folderless',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: [
					'task',
				],
				operation: [
					'create',
				],
			},
		},
		required: true,
	},
	{
		displayName: 'Folder ID',
		name: 'folderId',
		type: 'options',
		default: '',
		displayOptions: {
			show: {
				resource: [
					'task',
				],
				operation: [
					'create',
				],
				folderless: [
					false,
				],
			},
		},
		typeOptions: {
			loadOptionsMethod: 'getFolders',
			loadOptionsDependsOn: [
				'spaceId',
			],
		},
		required: true,
	},
	{
		displayName: 'List ID',
		name: 'listId',
		type: 'options',
		default: '',
		displayOptions: {
			show: {
				resource: [
					'task',
				],
				operation: [
					'create',
				],
				folderless: [
					true,
				],
			},
		},
		typeOptions: {
			loadOptionsMethod: 'getFolderlessLists',
			loadOptionsDependsOn: [
				'spaceId',
			],
		},
		required: true,
	},
	{
		displayName: 'List ID',
		name: 'listId',
		type: 'options',
		default: '',
		displayOptions: {
			show: {
				resource: [
					'task',
				],
				operation: [
					'create',
				],
				folderless: [
					false,
				],
			},
		},
		typeOptions: {
			loadOptionsMethod: 'getLists',
			loadOptionsDependsOn: [
				'folderId',
			]
		},
		required: true,
	},
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: [
					'task',
				],
				operation: [
					'create',
				],
			},
		},
		required: true,
		description: 'The first name on the task',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: [
					'task',
				],
				operation: [
					'create',
				],
			},
		},
		options: [
			{
				displayName: 'Assignees',
				name: 'assignees',
				type: 'multiOptions',
				loadOptionsDependsOn: [
					'listId',
				],
				typeOptions: {
					loadOptionsMethod: 'getAssignees',
				},

				default: [],
			},
			{
				displayName: 'Custom Fields JSON',
				name: 'customFieldsJson',
				type: 'json',
				typeOptions: {
					alwaysOpenEditWindow: true,
				},
				default: '',
				description: 'Custom fields to set as JSON in the format:<br />[{"id": "", "value": ""}]',
			},
			{
				displayName: 'Content',
				name: 'content',
				type: 'string',
				typeOptions: {
					alwaysOpenEditWindow: true,
				},
				default: '',
			},
			{
				displayName: 'Due Date',
				name: 'dueDate',
				type: 'dateTime',
				default: '',
			},
			{
				displayName: 'Due Date Time',
				name: 'dueDateTime',
				type: 'boolean',
				default: false,
			},
			{
				displayName: 'Is Markdown Content',
				name: 'markdownContent',
				type: 'boolean',
				default: false,
			},
			{
				displayName: 'Notify All',
				name: 'notifyAll',
				type: 'boolean',
				default: false,
			},
			{
				displayName: 'Parent ID',
				name: 'parentId',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Priority',
				name: 'priority',
				type: 'number',
				typeOptions: {
					minValue: 1,
					maxValue: 4,
				},
				description: 'Integer mapping as 1 : Urgent, 2 : High, 3 : Normal, 4 : Low',
				default: 3,
			},
			{
				displayName: 'Start Date Time',
				name: 'startDateTime',
				type: 'boolean',
				default: false,
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				loadOptionsDependsOn: [
					'listId',
				],
				typeOptions: {
					loadOptionsMethod: 'getStatuses',
				},
				default: '',
			},
			{
				displayName: 'Tags',
				name: 'tags',
				type: 'multiOptions',
				loadOptionsDependsOn: [
					'spaceId',
				],
				typeOptions: {
					loadOptionsMethod: 'getTags',
				},
				default: [],
				description: 'The array of tags applied to this task',
			},
			{
				displayName: 'Time Estimate',
				name: 'timeEstimate',
				type: 'number',
				description: 'time estimate in minutes',
				default: 1,
			},
		],
	},
/* -------------------------------------------------------------------------- */
/*                                task:update                                 */
/* -------------------------------------------------------------------------- */
	{
		displayName: 'Task ID',
		name: 'taskId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: [
					'task',
				],
				operation: [
					'update',
				],
			},
		},
		description: 'Task ID',
	},
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: [
					'task',
				],
				operation: [
					'update',
				],
			},
		},
		options: [
			{
				displayName: 'Content',
				name: 'content',
				type: 'string',
				typeOptions: {
					alwaysOpenEditWindow: true,
				},
				default: '',
			},
			{
				displayName: 'Due Date',
				name: 'dueDate',
				type: 'dateTime',
				default: '',
			},
			{
				displayName: 'Due Date Time',
				name: 'dueDateTime',
				type: 'boolean',
				default: false,
			},
			{
				displayName: 'Is Markdown Content',
				name: 'markdownContent',
				type: 'boolean',
				default: false,
			},
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Notify All',
				name: 'notifyAll',
				type: 'boolean',
				default: false,
			},
			{
				displayName: 'Parent ID',
				name: 'parentId',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Priority',
				name: 'priority',
				type: 'number',
				typeOptions: {
					minValue: 1,
					maxValue: 4,
				},
				description: 'Integer mapping as 1 : Urgent, 2 : High, 3 : Normal, 4 : Low',
				default: 3,
			},
			{
				displayName: 'Start Date Time',
				name: 'startDateTime',
				type: 'boolean',
				default: false,
			},
			{
				displayName: 'Time Estimate',
				name: 'timeEstimate',
				type: 'number',
				description: 'time estimate in minutes',
				default: 1,
			},
		],

	},
/* -------------------------------------------------------------------------- */
/*                                 task:get                                   */
/* -------------------------------------------------------------------------- */
	{
		displayName: 'Task ID',
		name: 'taskId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: [
					'task',
				],
				operation: [
					'get',
				],
			},
		},
		description: 'Task ID',
	},
/* -------------------------------------------------------------------------- */
/*                                 task:getAll                                */
/* -------------------------------------------------------------------------- */
	{
		displayName: 'Team ID',
		name: 'teamId',
		type: 'options',
		default: '',
		displayOptions: {
			show: {
				resource: [
					'task',
				],
				operation: [
					'getAll',
				],
			},
		},
		typeOptions: {
			loadOptionsMethod: 'getTeams',
		},
		required: true,
	},
	{
		displayName: 'Space ID',
		name: 'spaceId',
		type: 'options',
		default: '',
		displayOptions: {
			show: {
				resource: [
					'task',
				],
				operation: [
					'getAll',
				],
			},
		},
		typeOptions: {
			loadOptionsMethod: 'getSpaces',
			loadOptionsDependsOn: [
				'teamId',
			]
		},
		required: true,
	},
	{
		displayName: 'Folderless List',
		name: 'folderless',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: [
					'task',
				],
				operation: [
					'getAll',
				],
			},
		},
		required: true,
	},
	{
		displayName: 'Folder ID',
		name: 'folderId',
		type: 'options',
		default: '',
		displayOptions: {
			show: {
				resource: [
					'task',
				],
				operation: [
					'getAll',
				],
				folderless: [
					false,
				],
			},
		},
		typeOptions: {
			loadOptionsMethod: 'getFolders',
			loadOptionsDependsOn: [
				'spaceId',
			],
		},
		required: true,
	},
	{
		displayName: 'List ID',
		name: 'listId',
		type: 'options',
		default: '',
		displayOptions: {
			show: {
				resource: [
					'task',
				],
				operation: [
					'getAll',
				],
				folderless: [
					true,
				],
			},
		},
		typeOptions: {
			loadOptionsMethod: 'getFolderlessLists',
			loadOptionsDependsOn: [
				'spaceId',
			],
		},
		required: true,
	},
	{
		displayName: 'List ID',
		name: 'listId',
		type: 'options',
		default: '',
		displayOptions: {
			show: {
				resource: [
					'task',
				],
				operation: [
					'getAll',
				],
				folderless: [
					false,
				],
			},
		},
		typeOptions: {
			loadOptionsMethod: 'getLists',
			loadOptionsDependsOn: [
				'folderId',
			]
		},
		required: true,
	},
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: [
					'task',
				],
				operation: [
					'getAll',
				],
			},
		},
		default: true,
		description: 'If all results should be returned or only up to a given limit.',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		displayOptions: {
			show: {
				resource: [
					'task',
				],
				operation: [
					'getAll',
				],
				returnAll: [
					false,
				],
			},
		},
		typeOptions: {
			minValue: 1,
			maxValue: 100,
		},
		default: 50,
		description: 'How many results to return.',
	},
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				resource: [
					'task',
				],
				operation: [
					'getAll',
				],
			},
		},
		options: [
			{
				displayName: 'Archived',
				name: 'archived',
				type: 'boolean',
				default: false,
			},
			{
				displayName: 'Assignees',
				name: 'assignees',
				type: 'multiOptions',
				loadOptionsDependsOn: [
					'listId',
				],
				typeOptions: {
					loadOptionsMethod: 'getAssignees',
				},

				default: [],
			},
			{
				displayName: 'Date Created Greater Than',
				name: 'dateCreatedGt',
				type: 'dateTime',
				default: '',
				description: 'Filter date created greater',
			},
			{
				displayName: 'Date Created Less Than',
				name: 'dateCreatedLt',
				type: 'dateTime',
				default: '',
				description: 'Filter date created less than posix time',
			},
			{
				displayName: 'Date Updated Greater Than',
				name: 'dateUpdatedGt',
				type: 'dateTime',
				default: '',
				description: 'Filter date updated greater than',
			},
			{
				displayName: 'Date Update Less Than',
				name: 'dateUpdatedLt',
				type: 'dateTime',
				default: '',
				description: 'Filter date updated less than',
			},
			{
				displayName: 'Due Date Greater Than',
				name: 'dueDateGt',
				type: 'dateTime',
				default: '',
				description: 'Filter due date greater than',
			},
			{
				displayName: 'Due Date Less Than',
				name: 'dueDateLt',
				type: 'dateTime',
				default: '',
				description: 'Filter due date less than',
			},
			{
				displayName: 'Include Closed',
				name: 'includeClosed',
				type: 'boolean',
				default: false,
				description: 'The response does by default not include closed tasks. Set this to true and dont send a status filter to include closed tasks.',
			},
			{
				displayName: 'Order By',
				name: 'orderBy',
				type: 'options',
				default: '',
				options: [
					{
						name: 'ID',
						value: 'id',
					},
					{
						name: 'Created',
						value: 'created',
					},
					{
						name: 'Updated',
						value: 'updated',
					},
					{
						name: 'Due Date',
						value: 'dueDate',
					},
				],
			},
			{
				displayName: 'Statuses',
				name: 'statuses',
				type: 'multiOptions',
				loadOptionsDependsOn: [
					'listId',
				],
				typeOptions: {
					loadOptionsMethod: 'getStatuses',
				},
				default: [],
			},
			{
				displayName: 'Subtasks',
				name: 'subtasks',
				type: 'boolean',
				default: false,
				description: 'Include subtasks, default false',
			},
			{
				displayName: 'Tags',
				name: 'tags',
				type: 'multiOptions',
				loadOptionsDependsOn: [
					'spaceId',
				],
				typeOptions: {
					loadOptionsMethod: 'getTags',
				},
				default: [],
				description: 'The array of tags applied to this task',
			},
		],
	},
/* -------------------------------------------------------------------------- */
/*                                task:delete                                 */
/* -------------------------------------------------------------------------- */
	{
		displayName: 'Task ID',
		name: 'taskId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: [
					'task',
				],
				operation: [
					'delete',
				],
			},
		},
		description: 'task ID',
	},
/* -------------------------------------------------------------------------- */
/*                                task:setCustomField                         */
/* -------------------------------------------------------------------------- */
	{
		displayName: 'Task ID',
		name: 'taskId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: [
					'task',
				],
				operation: [
					'setCustomField',
				],
			},
		},
		description: 'The ID of the task to add custom field to.',
	},
	{
		displayName: 'Field ID',
		name: 'fieldId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: [
					'task',
				],
				operation: [
					'setCustomField',
				],
			},
		},
		description: 'The ID of the field to add custom field to.',
	},
	{
		displayName: 'Value is JSON',
		name: 'jsonParse',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: [
					'task',
				],
				operation: [
					'setCustomField',
				]
			},
		},
		default: false,
		description: `The value is JSON and will be parsed as such. Is needed<br />
		if for example needed for labels which expects the value<br />
		to be an array.`,
	},
	{
		displayName: 'Value',
		name: 'value',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: [
					'task',
				],
				operation: [
					'setCustomField',
				],
			},
		},
		description: 'The value to set on custom field.',
	},
] as INodeProperties[];
