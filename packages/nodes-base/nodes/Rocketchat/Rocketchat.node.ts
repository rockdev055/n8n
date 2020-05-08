import {
	IExecuteSingleFunctions,
} from 'n8n-core';
import {
	IDataObject,
	INodeTypeDescription,
	INodeExecutionData,
	INodeType
} from 'n8n-workflow';
	import {
	rocketchatApiRequest,
	validateJSON
} from './GenericFunctions';

interface IField {
	short?: boolean;
	title?: string;
	value?: string;
}

interface IAttachment {
	color?: string;
	text?: string;
	ts?: string;
	title?: string;
	thumb_url?: string;
	message_link?: string;
	collapsed?: boolean;
	author_name?: string;
	author_link?: string;
	author_icon?: string;
	title_link?: string;
	title_link_download?: boolean;
	image_url?: string;
	audio_url?: string;
	video_url?: string;
	fields?: IField[];
}

interface IPostMessageBody {
	channel: string;
	text?: string;
	alias?: string;
	emoji?: string;
	avatar?: string;
	attachments?: IAttachment[];
}

export class Rocketchat implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Rocketchat',
		name: 'Rocketchat',
		icon: 'file:rocketchat.png',
		group: ['output'],
		version: 1,
		subtitle: '={{$parameter["resource"] + ": " + $parameter["operation"]}}',
		description: 'Consume Rocketchat API',
		defaults: {
			name: 'Rocketchat',
			color: '#c02428',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'rocketchatApi',
				required: true,
			}
		],
		properties: [
				{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				options: [
					{
						name: 'Chat',
						value: 'chat',
					},
				],
				default: 'chat',
				description: 'The resource to operate on.',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				displayOptions: {
					show: {
						resource: [
							'chat',
						],
					},
				},
				options: [
					{
						name: 'Post Message',
						value: 'postMessage',
						description: 'Post a message to a channel or a direct message',
					},
				],
				default: 'postMessage',
				description: 'The operation to perform.',
			},
			{
				displayName: 'Channel',
				name: 'channel',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: [
							'chat',
						],
						operation: [
							'postMessage'
						]
					},
				},
				default: '',
				description: 'The channel name with the prefix in front of it.',
			},
			{
				displayName: 'Text',
				name: 'text',
				type: 'string',
				displayOptions: {
					show: {
						resource: [
							'chat',
						],
						operation: [
							'postMessage'
						]
					},
				},
				default: '',
				description: 'The text of the message to send, is optional because of attachments.',
			},
			{
				displayName: 'JSON Parameters',
				name: 'jsonParameters',
				type: 'boolean',
				default: false,
				description: '',
				displayOptions: {
					show: {
						resource: [
							'chat'
						],
						operation: [
							'postMessage',
						]
					},
				},
			},
			{
				displayName: 'Options',
				name: 'options',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				displayOptions: {
					show: {
						resource: [
							'chat',
						],
						operation: [
							'postMessage',
						],
					},
				},
				options: [
					{
						displayName: 'Alias',
						name: 'alias',
						type: 'string',
						default: '',
						description: 'This will cause the message’s name to appear as the given alias, but your username will still display.',
					},
					{
						displayName: 'Avatar',
						name: 'avatar',
						type: 'string',
						default: '',
						description: 'If provided, this will make the avatar use the provided image url.',
					},
					{
						displayName: 'Emoji',
						name: 'emoji',
						type: 'string',
						default: '',
						description: 'This will cause the message’s name to appear as the given alias, but your username will still display.',
					}
				]
			},
			{
				displayName: 'Attachments',
				name: 'attachments',
				type: 'collection',
				default: {},
				placeholder: 'Add Attachment Item',
				typeOptions: {
					multipleValues: true,
					multipleValueButtonText: 'Add Attachment',

				},
				displayOptions: {
					show: {
						resource: [
							'chat',
						],
						operation: [
							'postMessage',
						],
						jsonParameters: [
							false
						],
					},
				},
				options: [
					{
						displayName: 'Color',
						name: 'color',
						type: 'color',
						default: '#ff0000',
						description: 'The color you want the order on the left side to be, any value background-css supports.',
					},
					{
						displayName: 'Text',
						name: 'text',
						type: 'string',
						default: '',
						description: 'The text to display for this attachment, it is different than the message’s text.',
					},
					{
						displayName: 'Timestamp',
						name: 'ts',
						type: 'dateTime',
						default: '',
						description: 'Displays the time next to the text portion.',
					},
					{
						displayName: 'Thumb URL',
						name: 'thumbUrl',
						type: 'string',
						default: '',
						description: 'An image that displays to the left of the text, looks better when this is relatively small.',
					},
					{
						displayName: 'Message Link',
						name: 'messageLink',
						type: 'string',
						default: '',
						description: 'Only applicable if the timestamp is provided, as it makes the time clickable to this link.',
					},
					{
						displayName: 'Collapsed',
						name: 'collapsed',
						type: 'boolean',
						default: false,
						description: 'Causes the image, audio, and video sections to be hiding when collapsed is true.',
					},
					{
						displayName: 'Author Name',
						name: 'authorName',
						type: 'string',
						default: '',
						description: 'Name of the author.',
					},
					{
						displayName: 'Author Link',
						name: 'authorLink',
						type: 'string',
						default: '',
						description: 'Providing this makes the author name clickable and points to this link.',
					},
					{
						displayName: 'Author Icon',
						name: 'authorIcon',
						type: 'string',
						default: '',
						placeholder: 'https://site.com/img.png',
						description: 'Displays a tiny icon to the left of the Author’s name.',
					},
					{
						displayName: 'Title',
						name: 'title',
						type: 'string',
						default: '',
						description: 'Title to display for this attachment, displays under the author.',
					},
					{
						displayName: 'Title Link',
						name: 'titleLink',
						type: 'string',
						default: '',
						description: 'Providing this makes the title clickable, pointing to this link.',
					},
					{
						displayName: 'Title Link Download',
						name: 'titleLinkDownload',
						type: 'boolean',
						default: false,
						description: 'When this is true, a download icon appears and clicking this saves the link to file.',
					},
					{
						displayName: 'Image URL',
						name: 'imageUrl',
						type: 'string',
						default: '',
						description: 'The image to display, will be “big” and easy to see.',
					},
					{
						displayName: 'Audio URL',
						name: 'audioUrl',
						type: 'string',
						default: '',
						placeholder: 'https://site.com/aud.mp3',
						description: 'Audio file to play, only supports what html audio does.',
					},
					{
						displayName: 'video URL',
						name: 'videoUrl',
						type: 'string',
						default: '',
						placeholder: 'https://site.com/vid.mp4',
						description: 'Video file to play, only supports what html video does.',
					},
					{
						displayName: 'Fields',
						name: 'fields',
						type: 'fixedCollection',
						placeholder: 'Add Field Item',
						typeOptions: {
							multipleValues: true,
						},
						default: '',
						options: [
							{
								name: 'fieldsValues',
								displayName: 'Fields',
								values: [
									{
										displayName: 'Short',
										name: 'short',
										type: 'boolean',
										default: false,
										description: 'Whether this field should be a short field.'
									},
									{
										displayName: 'Title',
										name: 'title',
										type: 'string',
										default: '',
										description: 'The title of this field.'
									},
									{
										displayName: 'Value',
										name: 'value',
										type: 'string',
										default: '',
										description: 'The value of this field, displayed underneath the title value.'
									},
								],
							},
						],
					},
				]
			},
			{
				displayName: 'Attachments',
				name: 'attachmentsJson',
				type: 'json',
				typeOptions: {
					alwaysOpenEditWindow: true,
				},
				displayOptions: {
					show: {
						resource: [
							'chat'
						],
						operation: [
							'postMessage'
						],
						jsonParameters: [
							true
						],
					},
				},
				default: '',
				required: false,
				description: '',
			}
		]
	};

	async executeSingle(this: IExecuteSingleFunctions): Promise<INodeExecutionData> {
		const resource = this.getNodeParameter('resource') as string;
		const operation = this.getNodeParameter('operation') as string;
		let response;

		if (resource === 'chat') {
			//https://rocket.chat/docs/developer-guides/rest-api/chat/postmessage
			if (operation === 'postMessage') {
				const channel = this.getNodeParameter('channel') as string;
				const text = this.getNodeParameter('text') as string;
				const options = this.getNodeParameter('options') as IDataObject;
				const jsonActive = this.getNodeParameter('jsonParameters') as boolean;

				const body: IPostMessageBody = {
					channel,
					text,
				};

				if (options.alias) {
					body.alias = options.alias as string;
				}
				if (options.avatar) {
					body.avatar = options.avatar as string;
				}
				if (options.emoji) {
					body.emoji = options.emoji as string;
				}

				if (!jsonActive) {
					const optionsAttachments = this.getNodeParameter('attachments') as IDataObject[];
					if (optionsAttachments.length > 0) {
						const attachments: IAttachment[] = [];
						for (let i = 0; i < optionsAttachments.length; i++) {
							const attachment: IAttachment = {};
							for (const option of Object.keys(optionsAttachments[i])) {
								if (option === 'color') {
									attachment.color = optionsAttachments[i][option] as string;
								} else if (option === 'text') {
									attachment.text = optionsAttachments[i][option] as string;
								} else if (option === 'ts') {
									attachment.ts = optionsAttachments[i][option] as string;
								} else if (option === 'messageLinks') {
									attachment.message_link = optionsAttachments[i][option] as string;
								} else if (option === 'thumbUrl') {
									attachment.thumb_url = optionsAttachments[i][option] as string;
								} else if (option === 'collapsed') {
									attachment.collapsed = optionsAttachments[i][option] as boolean;
								} else if (option === 'authorName') {
									attachment.author_name = optionsAttachments[i][option] as string;
								} else if (option === 'authorLink') {
									attachment.author_link = optionsAttachments[i][option] as string;
								} else if (option === 'authorIcon') {
									attachment.author_icon = optionsAttachments[i][option] as string;
								} else if (option === 'title') {
									attachment.title = optionsAttachments[i][option] as string;
								} else if (option === 'titleLink') {
									attachment.title_link = optionsAttachments[i][option] as string;
								} else if (option === 'titleLinkDownload') {
									attachment.title_link_download = optionsAttachments[i][option] as boolean;
								} else if (option === 'imageUrl') {
									attachment.image_url = optionsAttachments[i][option] as string;
								} else if (option === 'audioUrl') {
									attachment.audio_url = optionsAttachments[i][option] as string;
								} else if (option === 'videoUrl') {
									attachment.video_url = optionsAttachments[i][option] as string;
								} else if (option === 'fields') {
									const fieldsValues = (optionsAttachments[i][option] as IDataObject).fieldsValues as IDataObject[];
									if (fieldsValues.length > 0) {
										const fields: IField[] = [];
										for (let i = 0; i < fieldsValues.length; i++) {
											const field: IField = {};
											for (const key of Object.keys(fieldsValues[i])) {
												if (key === 'short') {
													field.short = fieldsValues[i][key] as boolean;
												} else if (key === 'title') {
													field.title = fieldsValues[i][key] as string;
												} else if (key === 'value') {
													field.value = fieldsValues[i][key] as string;
												}
											}
											fields.push(field);
											attachment.fields = fields;
										}
									}
								}
							}
							attachments.push(attachment);
						}
						body.attachments = attachments;
					}
				} else {
					body.attachments = validateJSON(this.getNodeParameter('attachmentsJson') as string);
				}

				response = await rocketchatApiRequest.call(this, '/chat', 'POST', 'postMessage', body);
			}
		}

		return {
			json: response
		};
	}
}
