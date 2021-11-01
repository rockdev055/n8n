import { OptionsWithUri } from 'request';
import {
	IExecuteFunctions,
	IExecuteSingleFunctions,
	IHookFunctions,
	ILoadOptionsFunctions,
	IWebhookFunctions,
} from 'n8n-core';
import { IDataObject } from 'n8n-workflow';

export async function copperApiRequest(this: IHookFunctions | IExecuteFunctions | IExecuteSingleFunctions | ILoadOptionsFunctions | IWebhookFunctions, method: string, resource: string, body: any = {}, qs: IDataObject = {}, uri?: string, option: IDataObject = {}): Promise<any> { // tslint:disable-line:no-any
	const credentials = this.getCredentials('copperApi');
	if (credentials === undefined) {
		throw new Error('No credentials got returned!');
	}
	if (credentials.secret) {
		body.secret = {
			secret: credentials.secret as string,
		};
	};
	let options: OptionsWithUri = {
		headers: {
			'X-PW-AccessToken': credentials.apiKey,
			'X-PW-Application': 'developer_api',
			'X-PW-UserEmail': credentials.email,
			'Content-Type': 'application/json',
		},
		method,
		qs,
		body,
		uri: uri ||`https://api.prosperworks.com/developer_api/v1${resource}`,
		json: true
	};
	options = Object.assign({}, options, option);
	if (Object.keys(options.body).length === 0) {
		delete options.body;
	}

	try {
		return await this.helpers.request!(options);
	} catch (error) {
		throw new Error('Zoom Error: ' + error.message);
	}
}
