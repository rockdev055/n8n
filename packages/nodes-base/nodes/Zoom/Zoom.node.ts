import {
	IExecuteFunctions,
} from 'n8n-core';
import {
	IDataObject,
	INodeExecutionData,
	INodeType,
	ILoadOptionsFunctions,
	INodeTypeDescription,
	INodePropertyOptions,
} from 'n8n-workflow';
import {
	zoomApiRequest,
	zoomApiRequestAllItems,
} from './GenericFunctions';

import {
	meetingOperations,
	meetingFields,
} from './MeetingDescription';

import {
	meetingRegistrantOperations,
	meetingRegistrantFields,

} from './MeetingRegistrantDescription';

import {
	webinarOperations,
	webinarFields,
} from './WebinarDescription';

import * as moment from 'moment-timezone';

interface Settings {
	host_video?: boolean;
	participant_video?: boolean;
	panelists_video?: boolean;
	cn_meeting?: boolean;
	in_meeting?: boolean;
	join_before_host?: boolean;
	mute_upon_entry?: boolean;
	watermark?: boolean;
	audio?: string;
	alternative_hosts?: string;
	auto_recording?: string;
	registration_type?: number;
	approval_type?: number;
	practice_session?: boolean;
}
export class Zoom implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Zoom',
		name: 'zoom',
		group: ['input'],
		version: 1,
		description: 'Consume Zoom API',
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		defaults: {
			name: 'Zoom',
			color: '#0B6CF9'
		},
		icon: 'file:zoom.png',
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'zoomApi',
				required: true,
				displayOptions: {
					show: {
						authentication: [
							'accessToken',
						],
					},
				},
			},
			{
				name: 'zoomOAuth2Api',
				required: true,
				displayOptions: {
					show: {
						authentication: [
							'oAuth2',
						],
					},
				},
			},
		],
		properties: [
			{
				displayName: 'Authentication',
				name: 'authentication',
				type: 'options',
				options: [
					{
						name: 'Access Token',
						value: 'accessToken',
					},
					{
						name: 'OAuth2',
						value: 'oAuth2',
					},
				],
				default: 'accessToken',
				description: 'The resource to operate on.',
			},
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				options: [
					{
						name: 'Meeting',
						value: 'meeting'
					},
					{
						name: 'Meeting Registrant',
						value: 'meetingRegistrants'
					},
					{
						name: 'Webinar',
						value: 'webinar'
					}
				],
				default: 'meeting',
				description: 'The resource to operate on.'
			},
			//MEETINGS
			...meetingOperations,
			...meetingFields,

			//MEETING REGISTRANTS
			...meetingRegistrantOperations,
			...meetingRegistrantFields,

			//WEBINARS
			...webinarOperations,
			...webinarFields,
		]

	};
	methods = {
		loadOptions: {
			// Get all the timezones to display them to user so that he can select them easily
			async getTimezones(
				this: ILoadOptionsFunctions
			): Promise<INodePropertyOptions[]> {
				const returnData: INodePropertyOptions[] = [];
				for (const timezone of moment.tz.names()) {
					const timezoneName = timezone;
					const timezoneId = timezone;
					returnData.push({
						name: timezoneName,
						value: timezoneId
					});
				}
				return returnData;
			}
		}
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: IDataObject[] = [];
		let qs: IDataObject = {};
		let body: IDataObject = {};
		let responseData;
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			qs = {};
			//https://marketplace.zoom.us/docs/api-reference/zoom-api/
			if (resource === 'meeting') {

				if (operation === 'get') {
					//https://marketplace.zoom.us/docs/api-reference/zoom-api/meetings/meeting
					const meetingId = this.getNodeParameter('meetingId', i) as string;
					const additionalFields = this.getNodeParameter(
						'additionalFields',
						i
					) as IDataObject;
					if (additionalFields.showPreviousOccurrences) {
						qs.show_previous_occurrences = additionalFields.showPreviousOccurrences as boolean;

					}

					if (additionalFields.occurrenceId) {
						qs.occurrence_id = additionalFields.occurrenceId as string;

					}

					responseData = await zoomApiRequest.call(
						this,
						'GET',
						`/meetings/${meetingId}`,
						{},
						qs
					);
				}
				if (operation === 'getAll') {
					//https://marketplace.zoom.us/docs/api-reference/zoom-api/meetings/meetings
					const userId = this.getNodeParameter('userId', i) as string;
					const returnAll = this.getNodeParameter('returnAll', i) as boolean;

					const additionalFields = this.getNodeParameter(
						'additionalFields',
						i
					) as IDataObject;
					if (additionalFields.type) {
						qs.type = additionalFields.type as string;

					}
					if (returnAll) {
						responseData = await zoomApiRequestAllItems.call(this, 'meetings', 'GET', `/users/${userId}/meetings`, {}, qs);
					} else {
						qs.page_size = this.getNodeParameter('limit', i) as number;
						responseData = await zoomApiRequest.call(this, 'GET', `/users/${userId}/meetings`, {}, qs);

					}

				}
				if (operation === 'delete') {
					//https://marketplace.zoom.us/docs/api-reference/zoom-api/meetings/meetingdelete
					const meetingId = this.getNodeParameter('meetingId', i) as string;
					const additionalFields = this.getNodeParameter(
						'additionalFields',
						i
					) as IDataObject;
					if (additionalFields.scheduleForReminder) {
						qs.schedule_for_reminder = additionalFields.scheduleForReminder as boolean;

					}

					if (additionalFields.occurrenceId) {
						qs.occurrence_id = additionalFields.occurrenceId;

					}

					responseData = await zoomApiRequest.call(
						this,
						'DELETE',
						`/meetings/${meetingId}`,
						{},
						qs
					);
					responseData = { success: true };
				}
				if (operation === 'create') {
					//https://marketplace.zoom.us/docs/api-reference/zoom-api/meetings/meetingcreate
					const userId = this.getNodeParameter('userId', i) as string;
					const additionalFields = this.getNodeParameter(
						'additionalFields',
						i
					) as IDataObject;
					const settings: Settings = {};
					if (additionalFields.cnMeeting) {
						settings.cn_meeting = additionalFields.cnMeeting as boolean;

					}

					if (additionalFields.inMeeting) {
						settings.in_meeting = additionalFields.inMeeting as boolean;

					}

					if (additionalFields.joinBeforeHost) {
						settings.join_before_host = additionalFields.joinBeforeHost as boolean;

					}

					if (additionalFields.muteUponEntry) {
						settings.mute_upon_entry = additionalFields.muteUponEntry as boolean;

					}

					if (additionalFields.watermark) {
						settings.watermark = additionalFields.watermark as boolean;

					}

					if (additionalFields.audio) {
						settings.audio = additionalFields.audio as string;

					}

					if (additionalFields.alternativeHosts) {
						settings.alternative_hosts = additionalFields.alternativeHosts as string;

					}

					if (additionalFields.participantVideo) {
						settings.participant_video = additionalFields.participantVideo as boolean;

					}

					if (additionalFields.hostVideo) {
						settings.host_video = additionalFields.hostVideo as boolean;

					}

					if (additionalFields.autoRecording) {
						settings.auto_recording = additionalFields.autoRecording as string;

					}

					if (additionalFields.registrationType) {
						settings.registration_type = additionalFields.registrationType as number;

					}

					body = {
						settings,
					};

					if (additionalFields.topic) {
						body.topic = additionalFields.topic as string;

					}

					if (additionalFields.type) {
						body.type = additionalFields.type as string;

					}

					if (additionalFields.startTime) {
						body.start_time = additionalFields.startTime as string;

					}

					if (additionalFields.duration) {
						body.duration = additionalFields.duration as number;

					}

					if (additionalFields.scheduleFor) {
						body.schedule_for = additionalFields.scheduleFor as string;

					}

					if (additionalFields.timeZone) {
						body.timezone = additionalFields.timeZone as string;

					}

					if (additionalFields.password) {
						body.password = additionalFields.password as string;

					}

					if (additionalFields.agenda) {
						body.agenda = additionalFields.agenda as string;

					}
					responseData = await zoomApiRequest.call(
						this,
						'POST',
						`/users/${userId}/meetings`,
						body,
						qs
					);
				}
				if (operation === 'update') {
					//https://marketplace.zoom.us/docs/api-reference/zoom-api/meetings/meetingupdate
					const meetingId = this.getNodeParameter('meetingId', i) as string;
					const settings: Settings = {};
					const additionalFields = this.getNodeParameter(
						'additionalFields',
						i
					) as IDataObject;

					if (additionalFields.occurrenceId) {
						qs.occurrence_id = additionalFields.occurrenceId as string;
					}

					if (additionalFields.cnMeeting) {
						settings.cn_meeting = additionalFields.cnMeeting as boolean;

					}

					if (additionalFields.inMeeting) {
						settings.in_meeting = additionalFields.inMeeting as boolean;

					}

					if (additionalFields.joinBeforeHost) {
						settings.join_before_host = additionalFields.joinBeforeHost as boolean;

					}

					if (additionalFields.muteUponEntry) {
						settings.mute_upon_entry = additionalFields.muteUponEntry as boolean;

					}

					if (additionalFields.watermark) {
						settings.watermark = additionalFields.watermark as boolean;

					}

					if (additionalFields.audio) {
						settings.audio = additionalFields.audio as string;

					}

					if (additionalFields.alternativeHosts) {
						settings.alternative_hosts = additionalFields.alternativeHosts as string;

					}

					if (additionalFields.participantVideo) {
						settings.participant_video = additionalFields.participantVideo as boolean;

					}

					if (additionalFields.hostVideo) {
						settings.host_video = additionalFields.hostVideo as boolean;

					}

					if (additionalFields.autoRecording) {
						settings.auto_recording = additionalFields.autoRecording as string;

					}

					if (additionalFields.registrationType) {
						settings.registration_type = additionalFields.registrationType as number;

					}

					body = {
						settings,
					};
					if (additionalFields.topic) {
						body.topic = additionalFields.topic as string;

					}

					if (additionalFields.type) {
						body.type = additionalFields.type as string;

					}

					if (additionalFields.startTime) {
						body.start_time = additionalFields.startTime as string;

					}

					if (additionalFields.duration) {
						body.duration = additionalFields.duration as number;

					}

					if (additionalFields.scheduleFor) {
						body.schedule_for = additionalFields.scheduleFor as string;

					}

					if (additionalFields.timeZone) {
						body.timezone = additionalFields.timeZone as string;

					}

					if (additionalFields.password) {
						body.password = additionalFields.password as string;

					}

					if (additionalFields.agenda) {
						body.agenda = additionalFields.agenda as string;

					}

					responseData = await zoomApiRequest.call(
						this,
						'PATCH',
						`/meetings/${meetingId}`,
						body,
						qs
					);
					responseData = { updated: true };

				}
			}
			if (resource === 'meetingRegistrants') {
				if (operation === 'create') {
					//https://marketplace.zoom.us/docs/api-reference/zoom-api/meetings/meetingregistrantcreate
					const meetingId = this.getNodeParameter('meetingId', i) as string;
					const emailId = this.getNodeParameter('email', i) as string;
					body.email = emailId;
					const firstName = this.getNodeParameter('firstName', i) as string;
					body.first_name = firstName;
					const additionalFields = this.getNodeParameter(
						'additionalFields',
						i
					) as IDataObject;
					if (additionalFields.occurrenceId) {
						qs.occurrence_ids = additionalFields.occurrenceId as string;
					}
					if (additionalFields.lastName) {
						body.last_name = additionalFields.lastName as string;
					}
					if (additionalFields.address) {
						body.address = additionalFields.address as string;
					}
					if (additionalFields.city) {
						body.city = additionalFields.city as string;
					}
					if (additionalFields.state) {
						body.state = additionalFields.state as string;
					}
					if (additionalFields.country) {
						body.country = additionalFields.country as string;
					}
					if (additionalFields.zip) {
						body.zip = additionalFields.zip as string;
					}
					if (additionalFields.phone) {
						body.phone = additionalFields.phone as string;
					}
					if (additionalFields.comments) {
						body.comments = additionalFields.comments as string;
					}
					if (additionalFields.org) {
						body.org = additionalFields.org as string;
					}
					if (additionalFields.jobTitle) {
						body.job_title = additionalFields.jobTitle as string;
					}
					if (additionalFields.purchasingTimeFrame) {
						body.purchasing_time_frame = additionalFields.purchasingTimeFrame as string;
					}
					if (additionalFields.roleInPurchaseProcess) {
						body.role_in_purchase_process = additionalFields.roleInPurchaseProcess as string;
					}
					responseData = await zoomApiRequest.call(
						this,
						'POST',
						`/meetings/${meetingId}/registrants`,
						body,
						qs
					);
				}
				if (operation === 'getAll') {
					//https://marketplace.zoom.us/docs/api-reference/zoom-api/meetings/meetingregistrants
					const meetingId = this.getNodeParameter('meetingId', i) as string;
					const additionalFields = this.getNodeParameter(
						'additionalFields',
						i
					) as IDataObject;
					if (additionalFields.occurrenceId) {
						qs.occurrence_id = additionalFields.occurrenceId as string;
					}
					if (additionalFields.status) {
						qs.status = additionalFields.status as string;
					}
					const returnAll = this.getNodeParameter('returnAll', i) as boolean;
					if (returnAll) {
						responseData = await zoomApiRequestAllItems.call(this, 'results', 'GET', `/meetings/${meetingId}/registrants`, {}, qs);
					} else {
						qs.page_size = this.getNodeParameter('limit', i) as number;
						responseData = await zoomApiRequest.call(this, 'GET', `/meetings/${meetingId}/registrants`, {}, qs);

					}

				}
				if (operation === 'update') {
					//https://marketplace.zoom.us/docs/api-reference/zoom-api/meetings/meetingregistrantstatus
					const meetingId = this.getNodeParameter('meetingId', i) as string;
					const additionalFields = this.getNodeParameter(
						'additionalFields',
						i
					) as IDataObject;
					if (additionalFields.occurenceId) {
						qs.occurrence_id = additionalFields.occurrenceId as string;
					}
					if (additionalFields.action) {
						body.action = additionalFields.action as string;
					}
					responseData = await zoomApiRequest.call(
						this,
						'PUT',
						`/meetings/${meetingId}/registrants/status`,
						body,
						qs
					);
				}
			}
			if (resource === 'webinar') {
				if (operation === 'create') {
					//https://marketplace.zoom.us/docs/api-reference/zoom-api/webinars/webinarcreate
					const userId = this.getNodeParameter('userId', i) as string;
					const additionalFields = this.getNodeParameter(
						'additionalFields',
						i
					) as IDataObject;
					const settings: Settings = {};


					if (additionalFields.audio) {
						settings.audio = additionalFields.audio as string;

					}

					if (additionalFields.alternative_hosts) {
						settings.alternative_hosts = additionalFields.alternative_hosts as string;

					}

					if (additionalFields.panelists_video) {
						settings.panelists_video = additionalFields.panelists_video as boolean;

					}
					if (additionalFields.practice_session) {
						settings.practice_session = additionalFields.practice_session as boolean;

					}
					if (additionalFields.auto_recording) {
						settings.auto_recording = additionalFields.auto_recording as string;

					}

					if (additionalFields.registration_type) {
						settings.registration_type = additionalFields.registration_type as number;

					}
					if (additionalFields.approval_type) {
						settings.approval_type = additionalFields.approval_type as number;

					}

					body = {
						settings,
					};

					if (additionalFields.topic) {
						body.topic = additionalFields.topic as string;

					}

					if (additionalFields.type) {
						body.type = additionalFields.type as string;

					}

					if (additionalFields.startTime) {
						body.start_time = additionalFields.startTime as string;

					}

					if (additionalFields.duration) {
						body.duration = additionalFields.duration as number;

					}


					if (additionalFields.timeZone) {
						body.timezone = additionalFields.timeZone as string;

					}

					if (additionalFields.password) {
						body.password = additionalFields.password as string;

					}

					if (additionalFields.agenda) {
						body.agenda = additionalFields.agenda as string;

					}
					responseData = await zoomApiRequest.call(
						this,
						'POST',
						`/users/${userId}/webinars`,
						body,
						qs
					);
				}
				if (operation === 'get') {
					//https://marketplace.zoom.us/docs/api-reference/zoom-api/webinars/webinar
					const webinarId = this.getNodeParameter('webinarId', i) as string;

					const additionalFields = this.getNodeParameter(
						'additionalFields',
						i
					) as IDataObject;
					if (additionalFields.showPreviousOccurrences) {
						qs.show_previous_occurrences = additionalFields.showPreviousOccurrences as boolean;

					}

					if (additionalFields.occurrenceId) {
						qs.occurrence_id = additionalFields.occurrenceId as string;

					}

					responseData = await zoomApiRequest.call(
						this,
						'GET',
						`/webinars/${webinarId}`,
						{},
						qs
					);
				}
				if (operation === 'getAll') {
					//https://marketplace.zoom.us/docs/api-reference/zoom-api/webinars/webinars
					const userId = this.getNodeParameter('userId', i) as string;
					const returnAll = this.getNodeParameter('returnAll', i) as boolean;
					if (returnAll) {
						responseData = await zoomApiRequestAllItems.call(this, 'results', 'GET', `/users/${userId}/webinars`, {}, qs);
					} else {
						qs.page_size = this.getNodeParameter('limit', i) as number;
						responseData = await zoomApiRequest.call(this, 'GET', `/users/${userId}/webinars`, {}, qs);

					}
				}
				if (operation === 'delete') {
					//https://marketplace.zoom.us/docs/api-reference/zoom-api/webinars/webinardelete
					const webinarId = this.getNodeParameter('webinarId', i) as string;
					const additionalFields = this.getNodeParameter(
						'additionalFields',
						i
					) as IDataObject;


					if (additionalFields.occurrenceId) {
						qs.occurrence_id = additionalFields.occurrenceId;

					}

					responseData = await zoomApiRequest.call(
						this,
						'DELETE',
						`/webinars/${webinarId}`,
						{},
						qs
					);
					responseData = { success: true };
				}
				if (operation === 'update') {
					//https://marketplace.zoom.us/docs/api-reference/zoom-api/webinars/webinarupdate
					const webinarId = this.getNodeParameter('webinarId', i) as string;
					const additionalFields = this.getNodeParameter(
						'additionalFields',
						i
					) as IDataObject;
					if (additionalFields.occurrence_id) {
						qs.occurrence_id = additionalFields.occurrence_id as string;

					}
					const settings: Settings = {};
					if (additionalFields.audio) {
						settings.audio = additionalFields.audio as string;

					}
					if (additionalFields.alternative_hosts) {
						settings.alternative_hosts = additionalFields.alternative_hosts as string;

					}

					if (additionalFields.panelists_video) {
						settings.panelists_video = additionalFields.panelists_video as boolean;

					}
					if (additionalFields.practice_session) {
						settings.practice_session = additionalFields.practice_session as boolean;

					}
					if (additionalFields.auto_recording) {
						settings.auto_recording = additionalFields.auto_recording as string;

					}

					if (additionalFields.registration_type) {
						settings.registration_type = additionalFields.registration_type as number;

					}
					if (additionalFields.approval_type) {
						settings.approval_type = additionalFields.approval_type as number;

					}

					body = {
						settings,
					};

					if (additionalFields.topic) {
						body.topic = additionalFields.topic as string;

					}

					if (additionalFields.type) {
						body.type = additionalFields.type as string;

					}

					if (additionalFields.startTime) {
						body.start_time = additionalFields.startTime as string;

					}

					if (additionalFields.duration) {
						body.duration = additionalFields.duration as number;

					}


					if (additionalFields.timeZone) {
						body.timezone = additionalFields.timeZone as string;

					}

					if (additionalFields.password) {
						body.password = additionalFields.password as string;

					}

					if (additionalFields.agenda) {
						body.agenda = additionalFields.agenda as string;

					}
					responseData = await zoomApiRequest.call(
						this,
						'PATCH',
						`/users/${webinarId}/webinars`,
						body,
						qs
					);
				}
			}
		}
		if (Array.isArray(responseData)) {
			returnData.push.apply(returnData, responseData as IDataObject[]);
		} else {
			returnData.push(responseData as IDataObject);
		}

		return [this.helpers.returnJsonArray(returnData)];
	}
}
