import {
	ICredentialType,
	NodePropertyTypes,
} from 'n8n-workflow';

export class PaddleApi implements ICredentialType {
	name = 'paddleApi';
	displayName = 'Paddle API';
	properties = [
		{
			displayName: 'Vendor Auth Code',
			name: 'vendorAuthCode',
			type: 'string' as NodePropertyTypes,
			default: '',
		},
		{
			displayName: 'Vendor ID',
			name: 'vendorId',
			type: 'string' as NodePropertyTypes,
			default: '',
		},
	];
}
