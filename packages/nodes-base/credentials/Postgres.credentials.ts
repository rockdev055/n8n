import {
	ICredentialType,
	NodePropertyTypes,
} from 'n8n-workflow';


export class Postgres implements ICredentialType {
	name = 'postgres';
	displayName = 'Postgres';
	properties = [
		{
			displayName: 'Host',
			name: 'host',
			type: 'string' as NodePropertyTypes,
			default: 'localhost',
		},
		{
			displayName: 'Database',
			name: 'database',
			type: 'string' as NodePropertyTypes,
			default: 'postgres',
		},
		{
			displayName: 'User',
			name: 'user',
			type: 'string' as NodePropertyTypes,
			default: 'postgres',
		},
		{
			displayName: 'Password',
			name: 'password',
			type: 'string' as NodePropertyTypes,
			typeOptions: {
				password: true,
			},
			default: '',
		},
		{
			displayName: 'SSL',
			name: 'ssl',
			type: 'options' as NodePropertyTypes,
			options: [
				{ name: 'disable', value: 'disable' },
				{ name: 'allow', value: 'allow' },
				{ name: 'require', value: 'require' },
				{ name: 'verify', value: 'verify (not implemented)' },
				{ name: 'verify-full', value: 'verify-full (not implemented)' }
			],
			default: 'disable',
		},
		{
			displayName: 'Port',
			name: 'port',
			type: 'number' as NodePropertyTypes,
			default: 5432,
		},
	];
}
