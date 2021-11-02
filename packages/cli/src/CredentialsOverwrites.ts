import {
	ICredentialDataDecryptedObject,
} from 'n8n-workflow';

import {
	ICredentialsOverwrite,
	GenericHelpers,
} from './';


class CredentialsOverwritesClass {

	private overwriteData: ICredentialsOverwrite = {};

	async init() {
		const data = await GenericHelpers.getConfigValue('credentials.overwrite') as string;

		try {
			this.overwriteData = JSON.parse(data);
		} catch (error) {
			throw new Error(`The credentials-overwrite is not valid JSON.`);
		}
	}

	applyOverwrite(type: string, data: ICredentialDataDecryptedObject) {
		const overwrites = this.get(type);

		if (overwrites === undefined) {
			return data;
		}

		const returnData = JSON.parse(JSON.stringify(data));
		Object.assign(returnData, overwrites);

		return returnData;
	}

	get(type: string): ICredentialDataDecryptedObject | undefined {
		return this.overwriteData[type];
	}

	getAll(): ICredentialsOverwrite {
		return this.overwriteData;
	}
}


let credentialsOverwritesInstance: CredentialsOverwritesClass | undefined;

export function CredentialsOverwrites(): CredentialsOverwritesClass {
	if (credentialsOverwritesInstance === undefined) {
		credentialsOverwritesInstance = new CredentialsOverwritesClass();
	}

	return credentialsOverwritesInstance;
}
