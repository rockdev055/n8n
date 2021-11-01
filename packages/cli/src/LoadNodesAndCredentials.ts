import {
	CUSTOM_EXTENSION_ENV,
	UserSettings,
} from 'n8n-core';
import {
	ICredentialType,
	INodeType,
} from 'n8n-workflow';
import {
	IN8nConfigNodes,
} from './';

import { promises as fs } from 'fs';
import * as path from 'path';
import * as glob from 'glob-promise';

import * as config from 'config';



class LoadNodesAndCredentialsClass {
	nodeTypes: {
		[key: string]: INodeType
	} = {};

	credentialTypes: {
		[key: string]: ICredentialType
	} = {};

	excludeNodes: string[] | undefined = undefined;

	nodeModulesPath = '';

	async init(directory?: string) {
		// Get the path to the node-modules folder to be later able
		// to load the credentials and nodes
		const checkPaths = [
			// In case "n8n" package is in same node_modules folder.
			path.join(__dirname, '..', '..', '..', 'n8n-workflow'),
			// In case "n8n" package is the root and the packages are
			// in the "node_modules" folder underneath it.
			path.join(__dirname, '..', '..', 'node_modules', 'n8n-workflow'),
		];
		for (const checkPath of checkPaths) {
			try {
				await fs.access(checkPath);
				// Folder exists, so use it.
				this.nodeModulesPath = path.dirname(checkPath);
				break;
			} catch (error) {
				// Folder does not exist so get next one
				continue;
			}
		}

		if (this.nodeModulesPath === '') {
			throw new Error('Could not find "node_modules" folder!');
		}

		const nodeSettings = config.get('nodes') as IN8nConfigNodes | undefined;
		if (nodeSettings !== undefined && nodeSettings.exclude !== undefined) {
			this.excludeNodes = nodeSettings.exclude;
		}

		// Get all the installed packages which contain n8n nodes
		const packages = await this.getN8nNodePackages();

		for (const packageName of packages) {
			await this.loadDataFromPackage(packageName);
		}

		// Read nodes and credentials from custom directories
		const customDirectories = [];

		// Add "custom" folder in user-n8n folder
		customDirectories.push(UserSettings.getUserN8nFolderCustomExtensionPath());

		// Add folders from special environment variable
		if (process.env[CUSTOM_EXTENSION_ENV] !== undefined) {
			const customExtensionFolders = process.env[CUSTOM_EXTENSION_ENV]!.split(';');
			customDirectories.push.apply(customDirectories, customExtensionFolders);
		}

		for (const directory of customDirectories) {
			await this.loadDataFromDirectory('CUSTOM', directory);
		}
	}


	/**
	 * Returns all the names of the packages which could
	 * contain n8n nodes
	 *
	 * @returns {Promise<string[]>}
	 * @memberof LoadNodesAndCredentialsClass
	 */
	async getN8nNodePackages(): Promise<string[]> {
		const packages: string[] = [];
		for (const file of await fs.readdir(this.nodeModulesPath)) {
			if (file.indexOf('n8n-nodes-') !== 0) {
				continue;
			}

			// Check if it is really a folder
			if (!(await fs.stat(path.join(this.nodeModulesPath, file))).isDirectory()) {
				continue;
			}

			packages.push(file);
		}

		return packages;
	}


	/**
	 * Loads credentials from a file
	 *
	 * @param {string} credentialName The name of the credentials
	 * @param {string} filePath The file to read credentials from
	 * @returns {Promise<void>}
	 * @memberof N8nPackagesInformationClass
	 */
	async loadCredentialsFromFile(credentialName: string, filePath: string): Promise<void> {
		const tempModule = require(filePath);

		let tempCredential: ICredentialType;
		try {
			tempCredential = new tempModule[credentialName]() as ICredentialType;
		} catch (e) {
			if (e instanceof TypeError) {
				throw new Error(`Class with name "${credentialName}" could not be found. Please check if the class is named correctly!`);
			} else {
				throw e;
			}
		}

		this.credentialTypes[credentialName] = tempCredential;
	}


	/**
	 * Loads a node from a file
	 *
	 * @param {string} packageName The package name to set for the found nodes
	 * @param {string} nodeName Tha name of the node
	 * @param {string} filePath The file to read node from
	 * @returns {Promise<void>}
	 * @memberof N8nPackagesInformationClass
	 */
	async loadNodeFromFile(packageName: string, nodeName: string, filePath: string): Promise<void> {
		let tempNode: INodeType;
		let fullNodeName: string;

		const tempModule = require(filePath);
		try {
			tempNode = new tempModule[nodeName]() as INodeType;
		} catch (error) {
			console.error(`Error loading node "${nodeName}" from: "${filePath}"`);
			throw error;
		}

		fullNodeName = packageName + '.' + tempNode.description.name;
		tempNode.description.name = fullNodeName;

		if (tempNode.description.icon !== undefined &&
			tempNode.description.icon.startsWith('file:')) {
			// If a file icon gets used add the full path
			tempNode.description.icon = 'file:' + path.join(path.dirname(filePath), tempNode.description.icon.substr(5));
		}

		// Check if the node should be skipped
		if (this.excludeNodes !== undefined && this.excludeNodes.includes(fullNodeName)) {
			return;
		}

		this.nodeTypes[fullNodeName] = tempNode;
	}


	/**
	 * Loads nodes and credentials from the given directory
	 *
	 * @param {string} setPackageName The package name to set for the found nodes
	 * @param {string} directory The directory to look in
	 * @returns {Promise<void>}
	 * @memberof N8nPackagesInformationClass
	 */
	async loadDataFromDirectory(setPackageName: string, directory: string): Promise<void> {
		const files = await glob(path.join(directory, '*\.@(node|credentials)\.js'));

		let fileName: string;
		let type: string;

		const loadPromises = [];
		for (const filePath of files) {
			[fileName, type] = path.parse(filePath).name.split('.');

			if (type === 'node') {
				loadPromises.push(this.loadNodeFromFile(setPackageName, fileName, filePath));
			} else if (type === 'credentials') {
				loadPromises.push(this.loadCredentialsFromFile(fileName, filePath));
			}
		}

		await Promise.all(loadPromises);
	}


	/**
	 * Loads nodes and credentials from the package with the given name
	 *
	 * @param {string} packageName The name to read data from
	 * @returns {Promise<void>}
	 * @memberof N8nPackagesInformationClass
	 */
	async loadDataFromPackage(packageName: string): Promise<void> {
		// Get the absolute path of the package
		const packagePath = path.join(this.nodeModulesPath, packageName);

		// Read the data from the package.json file to see if any n8n data is defiend
		const packageFileString = await fs.readFile(path.join(packagePath, 'package.json'), 'utf8');
		const packageFile = JSON.parse(packageFileString);
		if (!packageFile.hasOwnProperty('n8n')) {
			return;
		}

		let tempPath: string, filePath: string;

		// Read all node types
		let fileName: string, type: string;
		if (packageFile.n8n.hasOwnProperty('nodes') && Array.isArray(packageFile.n8n.nodes)) {
			for (filePath of packageFile.n8n.nodes) {
				tempPath = path.join(packagePath, filePath);
				[fileName, type] = path.parse(filePath).name.split('.');
				await this.loadNodeFromFile(packageName, fileName, tempPath);
			}
		}

		// Read all credential types
		if (packageFile.n8n.hasOwnProperty('credentials') && Array.isArray(packageFile.n8n.credentials)) {
			for (filePath of packageFile.n8n.credentials) {
				tempPath = path.join(packagePath, filePath);
				[fileName, type] = path.parse(filePath).name.split('.');
				this.loadCredentialsFromFile(fileName, tempPath);
			}
		}
	}
}



let packagesInformationInstance: LoadNodesAndCredentialsClass | undefined;

export function LoadNodesAndCredentials(): LoadNodesAndCredentialsClass {
	if (packagesInformationInstance === undefined) {
		packagesInformationInstance = new LoadNodesAndCredentialsClass();
	}

	return packagesInformationInstance;
}
