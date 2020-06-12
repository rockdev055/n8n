import {
	IExecuteFunctions
} from 'n8n-core';

import {
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IDataObject,
} from 'n8n-workflow';

import {
	hackerNewsApiRequest,
	hackerNewsApiRequestAllItems
} from './GenericFunctions';

export class HackerNews implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Hacker News',
		name: 'hackerNews',
		icon: 'file:hackernews.png',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Consume Hacker News API',
		defaults: {
			name: 'Hacker News',
			color: '#ff6600',
		},
		inputs: ['main'],
		outputs: ['main'],
		properties: [
			// ----------------------------------
			//         Resources
			// ----------------------------------
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				options: [
					{
						name: 'Article',
						value: 'article'
					},
					{
						name: 'User',
						value: 'user'
					}
				],
				default: 'article',
				description: 'Resource to consume.',
			},
			// ----------------------------------
			//         Operations
			// ----------------------------------
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				displayOptions: {
					show: {
						resource: [
							'article'
						],
					},
				},
				options: [
					{
						name: 'Get',
						value: 'get',
						description: 'Get a Hacker News article',
					},
					{
						name: 'Get All',
						value: 'getAll',
						description: 'Get all Hacker News articles',
					}
				],
				default: 'get',
				description: 'Operation to perform.',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				displayOptions: {
					show: {
						resource: [
							'user'
						],
					},
				},
				options: [
					{
						name: 'Get',
						value: 'get',
						description: 'Get a Hacker News user',
					}
				],
				default: 'get',
				description: 'Operation to perform.',
			},
			// ----------------------------------
			//         Fields
			// ----------------------------------
			{
				displayName: 'Article ID',
				name: 'articleId',
				type: 'string',
				required: true,
				default: '',
				description: 'The ID of the Hacker News article to be returned',
				displayOptions: {
					show: {
						resource: [
							'article'
						],
						operation: [
							'get'
						],
					},
				},
			},
			{
				displayName: 'Username',
				name: 'username',
				type: 'string',
				required: true,
				default: '',
				description: 'The Hacker News user to be returned',
				displayOptions: {
					show: {
						resource: [
							'user'
						],
						operation: [
							'get'
						],
					},
				},
			},
			{
				displayName: 'Return All',
				name: 'returnAll',
				type: 'boolean',
				default: false,
				description: 'Whether to return all results for the query or only up to a limit.',
				displayOptions: {
					show: {
						resource: [
							'article'
						],
						operation: [
							'getAll'
						],
					},
				},
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				default: 5,
				description: 'Limit of Hacker News articles to be returned for the query.',
				displayOptions: {
					show: {
						resource: [
							'article'
						],
						operation: [
							'getAll'
						],
						returnAll: [
							false
						],
					},
				},
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
							'article'
						],
						operation: [
							'get'
						],
					},
				},
				options: [
					{
						displayName: 'Include comments',
						name: 'includeComments',
						type: 'boolean',
						default: false,
						description: 'Whether to include all the comments in a Hacker News article.'
					},
				]
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
							'article'
						],
						operation: [
							'getAll'
						],
					},
				},
				options: [
					{
						displayName: 'Keyword',
						name: 'keyword',
						type: 'string',
						default: '',
						description: 'The keyword for filtering the results of the query.',
					},
					{
						displayName: 'Tags',
						name: 'tags',
						type: 'multiOptions',
						options: [
							{
								name: 'Story',
								value: 'story',
								description: 'Returns query results filtered by story tag',
							},
							{
								name: 'Comment',
								value: 'comment',
								description: 'Returns query results filtered by comment tag',
							},
							{
								name: 'Poll',
								value: 'poll',
								description: 'Returns query results filtered by poll tag',
							},
							{
								name: 'Show HN',
								value: 'show_hn', // snake case per HN tags
								description: 'Returns query results filtered by Show HN tag',
							},
							{
								name: 'Ask HN',
								value: 'ask_hn', // snake case per HN tags
								description: 'Returns query results filtered by Ask HN tag',
							},
							{
								name: 'Front Page',
								value: 'front_page', // snake case per HN tags
								description: 'Returns query results filtered by Front Page tag',
							}
						],
						default: '',
						description: 'Tags for filtering the results of the query.',
					}
				]
			}
		]
	};


	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: IDataObject[] = [];

		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;
		let returnAll = false;

		for (let i = 0; i < items.length; i++) {

			let qs: IDataObject = {};
			let endpoint = '';
			let includeComments = false;

			if (resource === 'article') {

				if (operation === 'get') {

					endpoint = `items/${this.getNodeParameter('articleId', i)}`;
					const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;
					includeComments = additionalFields.includeComments as boolean;

				} else if (operation === 'getAll') {

					const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;
					const keyword = additionalFields.keyword as string;
					const tags = additionalFields.tags as string[];

					qs = {
						query: keyword,
						tags: tags ?  tags.join() : '',
					};

					returnAll = this.getNodeParameter('returnAll', i) as boolean;

					if (!returnAll) {
						qs.hitsPerPage = this.getNodeParameter('limit', i) as number;
					}

					endpoint = 'search?';

				} else {
					throw new Error(`The operation '${operation}' is unknown!`);
				}

			} else if (resource === 'user') {

				if (operation === 'get') {
					endpoint = `users/${this.getNodeParameter('username', i)}`;

				} else {
					throw new Error(`The operation '${operation}' is unknown!`);
				}

			} else {
				throw new Error(`The resource '${resource}' is unknown!`);
			}


			let responseData;
			if (returnAll === true) {
				responseData = await hackerNewsApiRequestAllItems.call(this, 'GET', endpoint, qs);
			} else {
				responseData = await hackerNewsApiRequest.call(this, 'GET', endpoint, qs);
				if (resource === 'article' && operation === 'getAll')
				responseData = responseData.hits;
			}

			if (resource === 'article' && operation === 'get' && !includeComments) {
				delete responseData.children;
			}

			if (Array.isArray(responseData)) {
				returnData.push.apply(returnData, responseData as IDataObject[]);
			} else {
				returnData.push(responseData as IDataObject);
			}

		}

		return [this.helpers.returnJsonArray(returnData)];

	}
}
