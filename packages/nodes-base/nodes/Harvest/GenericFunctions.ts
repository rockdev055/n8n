import { OptionsWithUri } from 'request';
import {
	IExecuteFunctions,
	IExecuteSingleFunctions,
	IHookFunctions,
	ILoadOptionsFunctions,
} from 'n8n-core';
import { IDataObject } from 'n8n-workflow';

export async function harvestApiRequest(
		this: IHookFunctions | IExecuteFunctions | IExecuteSingleFunctions | ILoadOptionsFunctions,
		method: string,
		qs: IDataObject = {},
		uri?: string,
		body: IDataObject = {},
		option: IDataObject = {},
	): Promise<any> { // tslint:disable-line:no-any

	const credentials = this.getCredentials('harvestApi') as IDataObject;

	if (credentials === undefined) {
		throw new Error('No credentials got returned!');
	}

	qs.access_token = credentials.accessToken;
	qs.account_id = credentials.accountId;
	// Convert to query string into a format the API can read
	const queryStringElements: string[] = [];
	for (const key of Object.keys(qs)) {
		if (Array.isArray(qs[key])) {
			(qs[key] as string[]).forEach(value => {
				queryStringElements.push(`${key}=${value}`);
			});
		} else {
			queryStringElements.push(`${key}=${qs[key]}`);
		}
	}

	let options: OptionsWithUri = {
		method,
		body,
		uri: `https://api.harvestapp.com/v2/${uri}?${queryStringElements.join('&')}`,
		json: true,
		headers: {
			"User-Agent": "Harvest API"
		}
	};
	console.log({options})

	options = Object.assign({}, options, option);
	if (Object.keys(options.body).length === 0) {
		delete options.body;
	}
	try {
		const result = await this.helpers.request!(options);
		console.log(result);
		return result;
	} catch (error) {
		if (error.statusCode === 401) {
			// Return a clear error
			throw new Error('The Harvest credentials are not valid!');
		}

		if (error.error && error.error.error_summary) {
			// Try to return the error prettier
			throw new Error(`Harvest error response [${error.statusCode}]: ${error.error.error_summary}`);
		}

		// If that data does not exist for some reason return the actual error
		throw error;
	}
}

/**
 * Make an API request to paginated flow endpoint
 * and return all results
 */
export async function harvestApiRequestAllItems(
		this: IHookFunctions | IExecuteFunctions | IExecuteSingleFunctions | ILoadOptionsFunctions,
		method: string,
		qs: IDataObject = {},
		uri?: string,
		body: IDataObject = {},
		option: IDataObject = {},
	): Promise<any> { // tslint:disable-line:no-any

	const returnData: IDataObject[] = [];

	let responseData;

	try {
		do {
			responseData = await harvestApiRequest.call(this, method, qs, uri, body, option);
			qs.cursor = responseData.cursor.id;
			returnData.push.apply(returnData, responseData.response);
		} while (
			responseData.cursor.more === true &&
			responseData.cursor.hasNext === true
		);
		return returnData;
		} catch(error) {
		throw error;
	}
}
