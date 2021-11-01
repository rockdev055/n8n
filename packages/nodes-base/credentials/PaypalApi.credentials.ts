import {
	ICredentialType,
	NodePropertyTypes,
} from 'n8n-workflow';


export class PayPalApi implements ICredentialType {
	name = 'paypalApi';
	displayName = 'PayPal API';
	properties = [
		{
			displayName: 'Client ID',
			name: 'clientId',
			type: 'string' as NodePropertyTypes,
			default: '',
		},
		{
			displayName: 'Secret',
			name: 'secret',
			type: 'string' as NodePropertyTypes,
			default: '',
		},
		{
			displayName: 'Enviroment',
			name: 'env',
			type: 'options' as NodePropertyTypes,
			default: 'live',
			options: [
				{
					name: 'Sanbox',
					value: 'sanbox'
				},
				{
					name: 'Live',
					value: 'live'
				},
			]
		},
	];
}
