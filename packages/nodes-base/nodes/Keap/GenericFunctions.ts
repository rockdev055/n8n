import {
	OptionsWithUri,
 } from 'request';

import {
	IExecuteFunctions,
	IHookFunctions,
	ILoadOptionsFunctions,
	IWebhookFunctions,
} from 'n8n-core';

import {
	IDataObject
} from 'n8n-workflow';

import {
	snakeCase,
 } from 'change-case';

export async function keapApiRequest(this: IWebhookFunctions | IHookFunctions | IExecuteFunctions | ILoadOptionsFunctions, method: string, resource: string, body: any = {}, qs: IDataObject = {}, uri?: string, headers: IDataObject = {}, option: IDataObject = {}): Promise<any> { // tslint:disable-line:no-any
	let options: OptionsWithUri = {
		headers: {
			'Content-Type': 'application/json',
		},
		method,
		body,
		qs,
		uri: uri || `https://api.infusionsoft.com/crm/rest/v1${resource}`,
		json: true
	};
	try {
		options = Object.assign({}, options, option);
		if (Object.keys(headers).length !== 0) {
			options.headers = Object.assign({}, options.headers, headers);
		}
		if (Object.keys(body).length === 0) {
			delete options.body;
		}
		//@ts-ignore
		return await this.helpers.requestOAuth.call(this, 'keapOAuth2Api', options);
	} catch (error) {
		if (error.response && error.response.body && error.response.body.message) {
			// Try to return the error prettier
			throw new Error(`Infusionsoft error response [${error.statusCode}]: ${error.response.body.message}`);
		}
		throw error;
	}
}

export async function keapApiRequestAllItems(this: IHookFunctions| IExecuteFunctions | ILoadOptionsFunctions, propertyName: string, method: string, endpoint: string, body: any = {}, query: IDataObject = {}): Promise<any> { // tslint:disable-line:no-any

	const returnData: IDataObject[] = [];

	let responseData;
	let uri: string | undefined;
	query.limit = 50;

	do {
		responseData = await keapApiRequest.call(this, method, endpoint, body, query, uri);
		uri = responseData.next;
		returnData.push.apply(returnData, responseData[propertyName]);
	} while (
		returnData.length < responseData.count
	);

	return returnData;
}

export function keysToSnakeCase(elements: IDataObject[] | IDataObject) : IDataObject[] {
	if (!Array.isArray(elements)) {
		elements = [elements];
	}
	for (const element of elements) {
		for (const key of Object.keys(element)) {
			if (key !== snakeCase(key)) {
				element[snakeCase(key)] = element[key];
				delete element[key];
			}
		}
	}
	return elements;
}
