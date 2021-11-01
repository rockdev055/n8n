import {
	ICredentialType,
	NodePropertyTypes,
} from 'n8n-workflow';

export class MailchimpApi implements ICredentialType {
	name = 'mailchimpApi';
	displayName = 'Mailchimp API';
	properties = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string' as NodePropertyTypes,
			default: '',
		},
		{
			displayName: 'Datacenter',
			name: 'datacenter',
			type: 'string' as NodePropertyTypes,
			default: '',
		},
	];
}
