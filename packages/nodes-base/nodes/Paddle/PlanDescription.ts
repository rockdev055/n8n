import {
	INodeProperties,
} from 'n8n-workflow';

export const planOperations = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		displayOptions: {
			show: {
				resource: [
					'plan',
				],
			},
		},
		options: [
			{
				name: 'Get All',
				value: 'getAll',
				description: 'Get all plans.',
			}
		],
		default: 'getAll',
		description: 'The operation to perform.',
	},
] as INodeProperties[];

export const planFields = [

/* -------------------------------------------------------------------------- */
/*                                 plan:getAll                                */
/* -------------------------------------------------------------------------- */
	{
		displayName: 'Plan ID',
		name: 'planId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: [
					'plan',
				],
				operation: [
					'getAll',
				],
			},
		},
		description: 'Filter: The subscription plan ID.',
	},
] as INodeProperties[];
