import { OptionsWithUri } from 'request';
import {
	IExecuteFunctions,
	IExecuteSingleFunctions,
	ILoadOptionsFunctions,
} from 'n8n-core';
import {
	IDataObject
} from 'n8n-workflow';

export async function salesforceApiRequest(this: IExecuteFunctions | IExecuteSingleFunctions | ILoadOptionsFunctions, method: string, resource: string, body: any = {}, qs: IDataObject = {}, uri?: string, option: IDataObject = {}): Promise<any> { // tslint:disable-line:no-any
	const credentials = this.getCredentials('salesforceOAuth2Api');
	const subdomain = (credentials!.accessTokenUrl as string).split('.')[0].split('/')[2];
	const options: OptionsWithUri = {
		method,
		body,
		qs,
		uri: uri || `https://${subdomain}.salesforce.com/services/data/v39.0${resource}`,
		json: true
	};
	try {
		//@ts-ignore
		return await this.helpers.requestOAuth.call(this, 'salesforceOAuth2Api', options);
	} catch (error) {
		if (error.response && error.response.body && error.response.body[0] && error.response.body[0].message) {
			// Try to return the error prettier
			throw new Error(`Salesforce error response [${error.statusCode}]: ${error.response.body[0].message}`);
		}
		throw error;
	}
}

export async function salesforceApiRequestAllItems(this: IExecuteFunctions | ILoadOptionsFunctions, propertyName: string ,method: string, endpoint: string, body: any = {}, query: IDataObject = {}): Promise<any> { // tslint:disable-line:no-any

	const returnData: IDataObject[] = [];

	let responseData;
	let uri: string | undefined;

	do {
		responseData = await salesforceApiRequest.call(this, method, endpoint, body, query, uri);
		uri = responseData.nextRecordsUrl;
		returnData.push.apply(returnData, responseData[propertyName]);
	} while (
		responseData.nextRecordsUrl !== undefined &&
		responseData.nextRecordsUrl !== null
	);

	return returnData;
}
