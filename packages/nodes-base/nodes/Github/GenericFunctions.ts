import { OptionsWithUri } from 'request';

import {
	IExecuteFunctions,
	IHookFunctions,
} from 'n8n-core';

import {
	IDataObject,
} from 'n8n-workflow';

/**
 * Make an API request to Github
 *
 * @param {IHookFunctions} this
 * @param {string} method
 * @param {string} url
 * @param {object} body
 * @returns {Promise<any>}
 */
export async function githubApiRequest(this: IHookFunctions | IExecuteFunctions, method: string, endpoint: string, body: object, query?: object): Promise<any> { // tslint:disable-line:no-any
	const authenticationMethod = this.getNodeParameter('authentication', 0, 'accessToken') as string;

	const options: OptionsWithUri = {
		method,
		headers: {
			'User-Agent': 'n8n',
		},
		body,
		qs: query,
		uri: `https://api.github.com${endpoint}`,
		json: true
	};

	try {
		if (authenticationMethod === 'accessToken') {
			const credentials = this.getCredentials('githubApi');
			if (credentials === undefined) {
				throw new Error('No credentials got returned!');
			}
			options.headers!.Authorization = `token ${credentials.accessToken}`;
			return await this.helpers.request(options);
		} else {
			return await this.helpers.requestOAuth.call(this, 'githubOAuth2Api', options);
		}
	} catch (error) {
		if (error.statusCode === 401) {
			// Return a clear error
			throw new Error('The Github credentials are not valid!');
		}

		if (error.response && error.response.body && error.response.body.message) {
			// Try to return the error prettier
			throw new Error(`Github error response [${error.statusCode}]: ${error.response.body.message}`);
		}

		// If that data does not exist for some reason return the actual error
		throw error;
	}
}



/**
 * Returns the SHA of the given file
 *
 * @export
 * @param {(IHookFunctions | IExecuteFunctions)} this
 * @param {string} owner
 * @param {string} repository
 * @param {string} filePath
 * @param {string} [branch]
 * @returns {Promise<any>}
 */
export async function getFileSha(this: IHookFunctions | IExecuteFunctions, owner: string, repository: string, filePath: string, branch?: string): Promise<any> { // tslint:disable-line:no-any
	const getBody: IDataObject = {};
	if (branch !== undefined) {
		getBody.branch = branch;
	}
	const getEndpoint = `/repos/${owner}/${repository}/contents/${encodeURI(filePath)}`;
	const responseData = await githubApiRequest.call(this, 'GET', getEndpoint, getBody, {});

	if (responseData.sha === undefined) {
		throw new Error('Could not get the SHA of the file.');
	}
	return responseData.sha;
}
