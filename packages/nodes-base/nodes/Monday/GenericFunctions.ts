import { OptionsWithUri } from 'request';

import {
	IExecuteFunctions,
	ILoadOptionsFunctions,
} from 'n8n-core';

import {
	IDataObject,
	IHookFunctions,
	IWebhookFunctions
} from 'n8n-workflow';

export async function mondayApiRequest(this: IExecuteFunctions | IWebhookFunctions | IHookFunctions | ILoadOptionsFunctions, body: any = {}, option: IDataObject = {}): Promise<any> { // tslint:disable-line:no-any

	const credentials = this.getCredentials('mondayApi');

	if (credentials === undefined) {
		throw new Error('No credentials got returned!');
	}

	const endpoint = 'https://api.monday.com/v2/';

	let options: OptionsWithUri = {
		headers: {
			'Content-Type': 'application/json',
			'Authorization': credentials.apiToken,
		},
		method: 'POST',
		body,
		uri: endpoint,
		json: true
	};
	options = Object.assign({}, options, option);
	try {
		return await this.helpers.request!(options);
	} catch (error) {
		if (error.response) {
			const errorMessage = error.response.body.error_message;
			throw new Error(`Monday error response [${error.statusCode}]: ${errorMessage}`);
		}
		throw error;
	}
}

export async function mondayApiRequestAllItems(this: IHookFunctions | IExecuteFunctions | ILoadOptionsFunctions, propertyName: string, body: any = {}): Promise<any> { // tslint:disable-line:no-any

	const returnData: IDataObject[] = [];

	let responseData;
	body.variables.limit = 50;
	body.variables.page = 1;

	do {
		responseData = await mondayApiRequest.call(this, body);
		returnData.push.apply(returnData, responseData['data'][propertyName]);
		body.variables.page++;
	} while (
		responseData['data'][propertyName].length > 0
	);
	return returnData;
}