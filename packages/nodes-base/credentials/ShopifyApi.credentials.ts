import {
	ICredentialType,
	NodePropertyTypes,
} from 'n8n-workflow';

export class ShopifyApi implements ICredentialType {
	name = 'shopifyApi';
	displayName = 'Shopify API';
	properties = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			required: true,
			type: 'string' as NodePropertyTypes,
			default: '',
		},
		{
			displayName: 'Password',
			name: 'password',
			required: true,
			type: 'string' as NodePropertyTypes,
			default: '',
		},
		{
			displayName: 'Shop Name',
			name: 'shopName',
			required: true,
			type: 'string' as NodePropertyTypes,
			default: '',
		},
		{
			displayName: 'Shared Secret',
			name: 'sharedSecret',
			type: 'string' as NodePropertyTypes,
			default: '',
		},
	];
}
