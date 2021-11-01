
import {
	IProcessMessageDataHook,
	IWorkflowExecutionDataProcessWithExecution,
	NodeTypes,
	WorkflowExecuteAdditionalData,
} from './';

import {
	IProcessMessage,
	WorkflowExecute,
} from 'n8n-core';

import {
	IDataObject,
	IExecutionError,
	INodeType,
	INodeTypeData,
	IRun,
	ITaskData,
	IWorkflowExecuteHooks,
	Workflow,
} from 'n8n-workflow';
import { ChildProcess } from 'child_process';

export class WorkflowRunnerProcess {
	data: IWorkflowExecutionDataProcessWithExecution | undefined;
	startedAt = new Date();
	workflow: Workflow | undefined;
	workflowExecute: WorkflowExecute | undefined;

	async runWorkflow(inputData: IWorkflowExecutionDataProcessWithExecution): Promise<IRun> {
		this.data = inputData;
		let className: string;
		let tempNode: INodeType;
		let filePath: string;

		this.startedAt = new Date();

		const nodeTypesData: INodeTypeData = {};
		for (const nodeTypeName of Object.keys(this.data.nodeTypeData)) {
			className = this.data.nodeTypeData[nodeTypeName].className;

			filePath = this.data.nodeTypeData[nodeTypeName].sourcePath;
			const tempModule = require(filePath);

			try {
				tempNode = new tempModule[className]() as INodeType;
			} catch (error) {
				throw new Error(`Error loading node "${nodeTypeName}" from: "${filePath}"`);
			}

			nodeTypesData[nodeTypeName] = {
				type: tempNode,
				sourcePath: filePath,
			};
		}

		const nodeTypes = NodeTypes();
		await nodeTypes.init(nodeTypesData);

		this.workflow = new Workflow(this.data.workflowData.id as string | undefined, this.data.workflowData!.nodes, this.data.workflowData!.connections, this.data.workflowData!.active, nodeTypes, this.data.workflowData!.staticData);
		const additionalData = await WorkflowExecuteAdditionalData.getBase(this.data.executionMode, this.data.credentials);
		additionalData.hooks = this.getProcessForwardHooks();


		if (this.data.executionData !== undefined) {
			this.workflowExecute = new WorkflowExecute(additionalData, this.data.executionMode, this.data.executionData);
			return this.workflowExecute.processRunExecutionData(this.workflow);
		} else if (this.data.runData === undefined || this.data.startNodes === undefined || this.data.startNodes.length === 0 || this.data.destinationNode === undefined) {
			// Execute all nodes

			// Can execute without webhook so go on
			this.workflowExecute = new WorkflowExecute(additionalData, this.data.executionMode);
			return this.workflowExecute.run(this.workflow, undefined, this.data.destinationNode);
		} else {
			// Execute only the nodes between start and destination nodes
			this.workflowExecute = new WorkflowExecute(additionalData, this.data.executionMode);
			return this.workflowExecute.runPartialWorkflow(this.workflow, this.data.runData, this.data.startNodes, this.data.destinationNode);
		}
	}


	sendHookToParentProcess(hook: string, parameters: any[]) { // tslint:disable-line:no-any
		(process as unknown as ChildProcess).send({
			type: 'processHook',
			data: {
				hook,
				parameters,
			} as IProcessMessageDataHook,
		} as IProcessMessage);
	}

	/**
	 * Create a wrapper for hooks which simply forwards the data to
	 * the parent process where they then can be executed with access
	 * to database and to PushService
	 *
	 * @param {ChildProcess} process
	 * @returns
	 */
	getProcessForwardHooks(): IWorkflowExecuteHooks {
		return {
			nodeExecuteBefore: [
				async (nodeName: string): Promise<void> => {
					this.sendHookToParentProcess('nodeExecuteBefore', [nodeName]);
				},
			],
			nodeExecuteAfter: [
				async (nodeName: string, data: ITaskData): Promise<void> => {
					this.sendHookToParentProcess('nodeExecuteAfter', [nodeName, data]);
				},
			],
			workflowExecuteBefore: [
				async (): Promise<void> => {
					this.sendHookToParentProcess('workflowExecuteBefore', []);
				}
			],
			workflowExecuteAfter: [
				async (fullRunData: IRun, newStaticData?: IDataObject): Promise<void> => {
					this.sendHookToParentProcess('workflowExecuteAfter', [fullRunData, newStaticData]);
				},
			]
		};
	}

}



/**
 * Sends data to parent process
 *
 * @param {string} type The type of data to send
 * @param {*} data The data
 */
function sendToParentProcess(type: string, data: any): void { // tslint:disable-line:no-any
	process.send!({
		type,
		data,
	});
}


const workflowRunner = new WorkflowRunnerProcess();


// Listen to messages from parent process which send the data of
// the worflow to process
process.on('message', async (message: IProcessMessage) => {
	try {
		if (message.type === 'startWorkflow') {
			const runData = await workflowRunner.runWorkflow(message.data);

			sendToParentProcess('end', {
				runData,
			});

			// Once the workflow got executed make sure the process gets killed again
			process.exit();
		} else if (message.type === 'stopExecution') {
			// The workflow execution should be stopped
			let fullRunData: IRun;

			if (workflowRunner.workflowExecute !== undefined) {
				// Workflow started already executing

				fullRunData = workflowRunner.workflowExecute.getFullRunData(workflowRunner.startedAt);

				// If there is any data send it to parent process
				await workflowRunner.workflowExecute.processSuccessExecution(workflowRunner.startedAt, workflowRunner.workflow!);
			} else {
				// Workflow did not get started yet
				fullRunData = {
					data: {
						resultData: {
							runData: {},
						},
					},
					finished: true,
					mode: workflowRunner.data!.executionMode,
					startedAt: workflowRunner.startedAt,
					stoppedAt: new Date(),
				};

				workflowRunner.sendHookToParentProcess('workflowExecuteAfter', [fullRunData]);
			}

			sendToParentProcess('end', {
				fullRunData,
			});

			// Stop process
			process.exit();
		}
	} catch (error) {
		// Catch all uncaught errors and forward them to parent process
		const executionError = {
			message: error.message,
			stack: error.stack,
		} as IExecutionError;

		sendToParentProcess('processError', {
			executionError,
		});
		process.exit();
	}
});