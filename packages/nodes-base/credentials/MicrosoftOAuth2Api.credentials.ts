import {
	ICredentialType,
	NodePropertyTypes,
} from 'n8n-workflow';

export class MicrosoftOAuth2Api implements ICredentialType {
	name = 'microsoftOAuth2Api';
	extends = [
		'oAuth2Api',
	];
	displayName = 'Microsoft OAuth2 API';
	properties = [
		{
			displayName: 'Authorization URL',
			name: 'authUrl',
			type: 'string' as NodePropertyTypes,
			default: 'https://login.microsoftonline.com/{yourtenantid}/oauth2/v2.0/authorize',
		},
		{
			displayName: 'Access Token URL',
			name: 'accessTokenUrl',
			type: 'string' as NodePropertyTypes,
			default: 'https://login.microsoftonline.com/{yourtenantid}/oauth2/v2.0/token',
		},
		//https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-permissions-and-consent
		{
			displayName: 'Scope',
			name: 'scope',
			type: 'hidden' as NodePropertyTypes,
			default: 'openid offline_access Files.ReadWrite',
		},
		{
			displayName: 'Auth URI Query Parameters',
			name: 'authQueryParameters',
			type: 'hidden' as NodePropertyTypes,
			default: 'response_mode=query',
		},
		{
			displayName: 'Authentication',
			name: 'authentication',
			type: 'hidden' as NodePropertyTypes,
			default: 'body',
		},
	];
}
