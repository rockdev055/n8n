import {
	ICredentialType,
	NodePropertyTypes,
} from 'n8n-workflow';

export class CopperApi implements ICredentialType {
	name = 'copperApi';
	displayName = 'Copper API';
	properties = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			required: true,
			type: 'string' as NodePropertyTypes,
			default: '',
		},
		{
			displayName: 'Email',
			name: 'email',
			required: true,
			type: 'string' as NodePropertyTypes,
			default: '',
		},
		{
			displayName: 'Secret',
			name: 'secret',
			type: 'string' as NodePropertyTypes,
			default: '',
		},
	];
}
