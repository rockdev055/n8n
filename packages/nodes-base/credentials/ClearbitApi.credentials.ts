import {
	ICredentialType,
	NodePropertyTypes,
} from 'n8n-workflow';

export class ClearbitApi implements ICredentialType {
	name = 'clearbitApi';
	displayName = 'Clearbit API';
	properties = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string' as NodePropertyTypes,
			default: '',
		},
	];
}
