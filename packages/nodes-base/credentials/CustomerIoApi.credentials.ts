import {
	ICredentialType,
	NodePropertyTypes,
} from 'n8n-workflow';


export class CustomerIoApi implements ICredentialType {
	name = 'customerIoApi';
	displayName = 'Customer.io API';
	properties = [
		{
			displayName: 'App API Key',
			name: 'apiKey',
			type: 'string' as NodePropertyTypes,
			default: '',
		},

	];
}
