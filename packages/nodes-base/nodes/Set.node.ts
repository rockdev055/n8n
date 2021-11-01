import { IExecuteFunctions } from 'n8n-core';
import {
	INodeExecutionData,
	INodeParameters,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';

import { set } from 'lodash';

export class Set implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Set',
		name: 'set',
		icon: 'fa:pen',
		group: ['input'],
		version: 1,
		description: 'Sets values on the items and removes if selected all other values.',
		defaults: {
			name: 'Set',
			color: '#0000FF',
		},
		inputs: ['main'],
		outputs: ['main'],
		properties: [
			{
				displayName: 'Keep Only Set',
				name: 'keepOnlySet',
				type: 'boolean',
				default: false,
				description: 'If only the values set on this node should be<br />kept and all others removed.',
			},
			{
				displayName: 'Values to Set',
				name: 'values',
				placeholder: 'Add Value',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				description: 'The value to set.',
				default: {},
				options: [
					{
						name: 'boolean',
						displayName: 'Boolean',
						values: [
							{
								displayName: 'Name',
								name: 'name',
								type: 'string',
								default: 'propertyName',
								description: 'Name of the property to write data to.<br />Supports dot-notation.<br />Example: "data.person[0].name"',
							},
							{
								displayName: 'Value',
								name: 'value',
								type: 'boolean',
								default: false,
								description: 'The boolean value to write in the property.',
							},
						]
					},
					{
						name: 'number',
						displayName: 'Number',
						values: [
							{
								displayName: 'Name',
								name: 'name',
								type: 'string',
								default: 'propertyName',
								description: 'Name of the property to write data to.<br />Supports dot-notation.<br />Example: "data.person[0].name"',
							},
							{
								displayName: 'Value',
								name: 'value',
								type: 'number',
								default: 0,
								description: 'The number value to write in the property.',
							},
						]
					},
					{
						name: 'string',
						displayName: 'String',
						values: [
							{
								displayName: 'Name',
								name: 'name',
								type: 'string',
								default: 'propertyName',
								description: 'Name of the property to write data to.<br />Supports dot-notation.<br />Example: "data.person[0].name"',
							},
							{
								displayName: 'Value',
								name: 'value',
								type: 'string',
								default: '',
								description: 'The string value to write in the property.',
							},
						]
					},
				],
			},
		]
	};


	execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {

		const items = this.getInputData();

		if (items.length === 0) {
			items.push({json: {}});
		}

		let item: INodeExecutionData;
		let keepOnlySet: boolean;
		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			keepOnlySet = this.getNodeParameter('keepOnlySet', itemIndex, []) as boolean;
			item = items[itemIndex];

			if (keepOnlySet === true) {
				item.json = {};
			}

			// Add boolean values
			(this.getNodeParameter('values.boolean', itemIndex, []) as INodeParameters[]).forEach((setItem) => {
				set(item.json, setItem.name as string, !!setItem.value);
			});

			// Add number values
			(this.getNodeParameter('values.number', itemIndex, []) as INodeParameters[]).forEach((setItem) => {
				set(item.json, setItem.name as string, setItem.value);
			});

			// Add string values
			(this.getNodeParameter('values.string', itemIndex, []) as INodeParameters[]).forEach((setItem) => {
				set(item.json, setItem.name as string, setItem.value);
			});
		}

		return this.prepareOutputData(items);
	}
}
