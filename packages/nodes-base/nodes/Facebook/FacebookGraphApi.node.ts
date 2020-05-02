import {
	BINARY_ENCODING,
	IExecuteFunctions,
} from 'n8n-core';
import {
	IBinaryData,
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';

import { OptionsWithUri } from 'request';

export class FacebookGraphApi implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Facebook Graph API',
		name: 'facebookGraphApi',
		icon: 'file:facebook.png',
		group: ['transform'],
		version: 1,
		description: 'Interacts with Facebook using the Graph API',
		defaults: {
			name: 'Facebook Graph API',
			color: '#772244',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'facebookGraphApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Host URL',
				name: 'hostUrl',
				type: 'options',
				options: [
					{
						name: 'Default',
						value: 'graph.facebook.com',
					},
					{
						name: 'Video Uploads',
						value: 'graph-video.facebook.com',
					}
				],
				default: 'graph.facebook.com',
				description: 'The Host URL of the request. Almost all requests are passed to the graph.facebook.com host URL. The single exception is video uploads, which use graph-video.facebook.com.',
				required: true,
			},
			{
				displayName: 'HTTP Request Method',
				name: 'httpRequestMethod',
				type: 'options',
				options: [
					{
						name: 'GET',
						value: 'GET',
					},
					{
						name: 'POST',
						value: 'POST',
					},
					{
						name: 'DELETE',
						value: 'DELETE',
					},
				],
				default: 'GET',
				description: 'The HTTP Method to be used for the request.',
				required: true,
			},
			{
				displayName: 'Graph API Version',
				name: 'graphApiVersion',
				type: 'options',
				options: [
					{
						name: 'Latest',
						value: '',
					},
					{
						name: 'v6.0',
						value: 'v6.0',
					},
					{
						name: 'v5.0',
						value: 'v5.0',
					},
					{
						name: 'v4.0',
						value: 'v4.0',
					},
					{
						name: 'v3.3',
						value: 'v3.3',
					},
					{
						name: 'v3.2',
						value: 'v3.2',
					},
					{
						name: 'v3.1',
						value: 'v3.1',
					},
					{
						name: 'v3.0',
						value: 'v3.0',
					},
					{
						name: 'v2.12',
						value: 'v2.12',
					},
				],
				default: '',
				description: 'The version of the Graph API to be used in the request.',
				required: true,
			},
			{
				displayName: 'Node',
				name: 'node',
				type: 'string',
				default: '',
				description: 'The node on which to operate. A node is an individual object with a unique ID. For example, there are many User node objects, each with a unique ID representing a person on Facebook.',
				placeholder: 'me',
				required: true,
			},
			{
				displayName: 'Edge',
				name: 'edge',
				type: 'string',
				default: '',
				description: 'Edge of the node on which to operate. Edges represent collections of objects wich are attached to the node.',
				placeholder: 'videos',
				required: false,
			},
			{
				displayName: 'Send Binary Data',
				name: 'sendBinaryData',
				type: 'boolean',
				displayOptions: {
					show: {
						httpRequestMethod: [
							'POST',
							'PUT',
						],
					},
				},
				default: false,
				required: true,
				description: 'If binary data should be send as body.',
			},
			{
				displayName: 'Binary Property',
				name: 'binaryPropertyName',
				type: 'string',
				required: false,
				default: '',
				placeholder: 'file:data',
				displayOptions: {
					hide: {
						sendBinaryData: [
							false,
						],
					},
					show: {
						httpRequestMethod: [
							'POST',
							'PUT',
						],
					},
				},
				description: `Name of the binary property which contains the data for the file to be uploaded.<br />
							For Form-Data Multipart, multiple can be provided in the format:<br />
							"sendKey1:binaryProperty1,sendKey2:binaryProperty2`,
			},
			{
				displayName: 'Options',
				name: 'options',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				options: [
					{
						displayName: 'Fields',
						name: 'fields',
						placeholder: 'Add Field',
						type: 'fixedCollection',
						typeOptions: {
							multipleValues: true,
						},
						displayOptions: {
							show: {
								'/httpRequestMethod': [
									'GET',
								],
							},
						},
						description: 'The list of fields to request in the GET request.',
						default: {},
						options: [
							{
								name: 'field',
								displayName: 'Field',
								values: [
									{
										displayName: 'Name',
										name: 'name',
										type: 'string',
										default: '',
										description: 'Name of the field.',
									},
								],
							},
						],
					},
					{
						displayName: 'Query Parameters',
						name: 'queryParameters',
						placeholder: 'Add Parameter',
						type: 'fixedCollection',
						typeOptions: {
							multipleValues: true,
						},
						description: 'The query parameters to send',
						default: {},
						options: [
							{
								name: 'parameter',
								displayName: 'Parameter',
								values: [
									{
										displayName: 'Name',
										name: 'name',
										type: 'string',
										default: '',
										description: 'Name of the parameter.',
									},
									{
										displayName: 'Value',
										name: 'value',
										type: 'string',
										default: '',
										description: 'Value of the parameter.',
									},
								],
							},
						],
					},
					{
						displayName: 'Query Parameters JSON',
						name: 'queryParametersJson',
						type: 'json',
						default: '{}',
						placeholder: '{\"field_name\": \"field_value\"}',
						description: 'The query parameters to send, defined as a JSON object',
						required: false,
					}
				],
			},
		],
	};


	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();

		let response: any; // tslint:disable-line:no-any
		const returnItems: INodeExecutionData[] = [];

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			const graphApiCredentials = this.getCredentials('facebookGraphApi');

			const hostUrl = this.getNodeParameter('hostUrl', itemIndex) as string;
			const httpRequestMethod = this.getNodeParameter('httpRequestMethod', itemIndex) as string;
			let graphApiVersion = this.getNodeParameter('graphApiVersion', itemIndex) as string;
			const node = this.getNodeParameter('node', itemIndex) as string;
			const edge = this.getNodeParameter('edge', itemIndex) as string;
			const options = this.getNodeParameter('options', itemIndex, {}) as IDataObject;

			if (graphApiVersion !== '') {
				graphApiVersion += '/';
			}

			let uri = `https://${hostUrl}/${graphApiVersion}${node}`;
			if (edge) {
				uri = `${uri}/${edge}`;
			}

			const requestOptions : OptionsWithUri = {
				headers: {
					accept: 'application/json,text/*;q=0.99',
				},
				method: httpRequestMethod,
				uri,
				json: true,
				gzip: true,
				qs: {
					access_token: graphApiCredentials!.accessToken,
				},
			};

			if (options !== undefined) {
				// Build fields query parameter as a comma separated list
				if (options.fields !== undefined) {
					const fields = options.fields as IDataObject;
					if (fields.field !== undefined) {
						const fieldsCsv = (fields.field as IDataObject[]).map(field => field.name).join(',');
						requestOptions.qs.fields = fieldsCsv;
					}
				}

				// Add the query parameters defined in the UI
				if (options.queryParameters !== undefined) {
					const queryParameters = options.queryParameters as IDataObject;

					if (queryParameters.parameter !== undefined) {
						for (const queryParameter of queryParameters.parameter as IDataObject[]) {
							requestOptions.qs[queryParameter.name as string] = queryParameter.value;
						}
					}
				}

				// Add the query parameters defined as a JSON object
				if (options.queryParametersJson) {
					let queryParametersJsonObj = {};
					try
					{
						queryParametersJsonObj = JSON.parse(options.queryParametersJson as string);
					} catch { /* Do nothing, at least for now */}
					const qs = requestOptions.qs;
					requestOptions.qs = {
						...qs,
						...queryParametersJsonObj,
					};
				}
			}

			const sendBinaryData = this.getNodeParameter('sendBinaryData', itemIndex, false) as boolean;
			if (sendBinaryData) {
				const item = items[itemIndex];
				if (item.binary === undefined) {
					throw new Error('No binary data exists on item!');
				}

				const binaryPropertyNameFull = this.getNodeParameter('binaryPropertyName', itemIndex) as string;

				let propertyName = 'file';
				let binaryPropertyName = binaryPropertyNameFull;
				if (binaryPropertyNameFull.includes(':')) {
					const binaryPropertyNameParts = binaryPropertyNameFull.split(':');
					propertyName = binaryPropertyNameParts[0];
					binaryPropertyName = binaryPropertyNameParts[1];
				}

				if (item.binary[binaryPropertyName] === undefined) {
					throw new Error(`No binary data property "${binaryPropertyName}" does not exists on item!`);
				}

				const binaryProperty = item.binary[binaryPropertyName] as IBinaryData;

				requestOptions.formData = {
					[propertyName]: {
						value: Buffer.from(binaryProperty.data, BINARY_ENCODING),
						options: {
							filename: binaryProperty.fileName,
							contentType: binaryProperty.mimeType,
						},
					},
				};
			}

			try {
				// Now that the options are all set make the actual http request
				response = await this.helpers.request(requestOptions);
			} catch (error) {
				if (this.continueOnFail() === false) {
					throw error;
				}

				returnItems.push(items[itemIndex]);

				continue;
			}

			if (typeof response === 'string') {
				if (this.continueOnFail() === false) {
					throw new Error('Response body is not valid JSON.');
				}

				returnItems.push(items[itemIndex]);
				continue;
			}

			returnItems.push({json: response});
		}

		return [returnItems];
	}
}
