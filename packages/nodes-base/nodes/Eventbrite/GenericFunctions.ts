import { OptionsWithUri } from 'request';
import {
	IExecuteFunctions,
	IHookFunctions,
	ILoadOptionsFunctions,
	IExecuteSingleFunctions,
} from 'n8n-core';
import { IDataObject } from 'n8n-workflow';

export async function eventbriteApiRequest(this: IHookFunctions | IExecuteFunctions | IExecuteSingleFunctions | ILoadOptionsFunctions, method: string, resource: string, body: any = {}, qs: IDataObject = {}, uri?: string, option: IDataObject = {}): Promise<any> { // tslint:disable-line:no-any
	const credentials = this.getCredentials('eventbriteApi');
	if (credentials === undefined) {
		throw new Error('No credentials got returned!');
	}

	let options: OptionsWithUri = {
		headers: { 'Authorization': `Bearer ${credentials.apiKey}`},
		method,
		qs,
		body,
		uri: uri ||`https://www.eventbriteapi.com/v3${resource}`,
		json: true
	};
	options = Object.assign({}, options, option);
	if (Object.keys(options.body).length === 0) {
		delete options.body;
	}

	try {
		return await this.helpers.request!(options);
	} catch (error) {
		let errorMessage = error.message;
		if (error.response.body) {
			errorMessage = error.response.body.message || error.response.body.Message || error.message;
		}

		throw new Error(errorMessage);
	}
}

/**
 * Make an API request to paginated flow endpoint
 * and return all results
 */
export async function eventbriteApiRequestAllItems(this: IHookFunctions | IExecuteFunctions| ILoadOptionsFunctions, propertyName: string, method: string, resource: string, body: any = {}, query: IDataObject = {}): Promise<any> { // tslint:disable-line:no-any

	const returnData: IDataObject[] = [];

	let responseData;

	let uri: string | undefined;

	do {
		responseData = await eventbriteApiRequest.call(this, method, resource, body, query, uri);
		query.continuation = responseData.pagination.continuation;
		returnData.push.apply(returnData, responseData[propertyName]);
	} while (
		responseData.pagination !== undefined &&
		responseData.pagination.has_more_items !== undefined &&
		responseData.pagination.has_more_items !== false
	);

	return returnData;
}
