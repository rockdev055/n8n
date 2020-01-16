import { OptionsWithUri } from 'request';
import {
	IExecuteFunctions,
	IExecuteSingleFunctions,
	IHookFunctions,
	ILoadOptionsFunctions,
	IWebhookFunctions,
} from 'n8n-core';
import { IDataObject } from 'n8n-workflow';

export async function gumroadApiRequest(this: IHookFunctions | IExecuteFunctions | IExecuteSingleFunctions | ILoadOptionsFunctions | IWebhookFunctions, method: string, resource: string, body: any = {}, qs: IDataObject = {}, uri?: string, option: IDataObject = {}): Promise<any> { // tslint:disable-line:no-any
	const credentials = this.getCredentials('gumroadApi');
	if (credentials === undefined) {
		throw new Error('No credentials got returned!');
	}
	body = Object.assign({ access_token: credentials.accessToken }, body);

	let options: OptionsWithUri = {
		method,
		qs,
		body,
		uri: uri ||`https://api.gumroad.com/v2${resource}`,
		json: true
	};
	options = Object.assign({}, options, option);
	if (Object.keys(options.body).length === 0) {
		delete options.body;
	}

	try {
		return await this.helpers.request!(options);
	} catch (error) {
		let errorMessage = error;
		if (!error.success) {
			errorMessage.message;
		}
		throw new Error('Gumroad Error: ' + errorMessage);
	}
}
