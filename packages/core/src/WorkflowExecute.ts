import {
	IConnection,
	IExecuteData,
	IExecutionError,
	INode,
	INodeConnections,
	INodeExecutionData,
	IRun,
	IRunData,
	IRunExecutionData,
	ITaskData,
	ITaskDataConnections,
	IWaitingForExecution,
	IWorkflowExecuteAdditionalData,
	WorkflowExecuteMode,
	Workflow,
} from 'n8n-workflow';
import {
	ActiveExecutions,
	NodeExecuteFunctions,
} from './';


export class WorkflowExecute {
	private additionalData: IWorkflowExecuteAdditionalData;
	private mode: WorkflowExecuteMode;
	private activeExecutions: ActiveExecutions.ActiveExecutions;
	private executionId: string | null = null;


	constructor(additionalData: IWorkflowExecuteAdditionalData, mode: WorkflowExecuteMode) {
		this.additionalData = additionalData;
		this.activeExecutions = ActiveExecutions.getInstance();
		this.mode = mode;
	}



	/**
	 * Executes the given workflow.
	 *
	 * @param {Workflow} workflow The workflow to execute
	 * @param {INode[]} [startNodes] Node to start execution from
	 * @param {string} [destinationNode] Node to stop execution at
	 * @returns {(Promise<string>)}
	 * @memberof WorkflowExecute
	 */
	async run(workflow: Workflow, startNodes?: INode[], destinationNode?: string): Promise<string> {
		// Get the nodes to start workflow execution from
		startNodes = startNodes || workflow.getStartNodes(destinationNode);

		// If a destination node is given we only run the direct parent nodes and no others
		let runNodeFilter: string[] | undefined = undefined;
		if (destinationNode) {
			// TODO: Combine that later with getStartNodes which does more or less the same tree iteration
			runNodeFilter = workflow.getParentNodes(destinationNode);
			runNodeFilter.push(destinationNode);
		}

		// Initialize the data of the start nodes
		const nodeExecutionStack: IExecuteData[] = [];
		startNodes.forEach((node) => {
			nodeExecutionStack.push(
				{
					node,
					data: {
						main: [
							[
								{
									json: {},
								},
							],
						],
					},
				},
			);
		});

		const runExecutionData: IRunExecutionData = {
			startData: {
				destinationNode,
				runNodeFilter,
			},
			resultData: {
				runData: {},
			},
			executionData: {
				contextData: {},
				nodeExecutionStack,
				waitingExecution: {},
			},
		};

		return this.runExecutionData(workflow, runExecutionData);
	}



	/**
	 * Executes the given workflow but only
	 *
	 * @param {Workflow} workflow The workflow to execute
	 * @param {IRunData} runData
	 * @param {string[]} startNodes Nodes to start execution from
	 * @param {string} destinationNode Node to stop execution at
	 * @returns {(Promise<string>)}
	 * @memberof WorkflowExecute
	 */
	async runPartialWorkflow(workflow: Workflow, runData: IRunData, startNodes: string[], destinationNode: string): Promise<string> {

		let incomingNodeConnections: INodeConnections | undefined;
		let connection: IConnection;

		const runIndex = 0;

		// Initialize the nodeExecutionStack and waitingExecution with
		// the data from runData
		const nodeExecutionStack: IExecuteData[] = [];
		const waitingExecution: IWaitingForExecution = {};
		for (const startNode of startNodes) {
			incomingNodeConnections = workflow.connectionsByDestinationNode[startNode];

			const incomingData: INodeExecutionData[][] = [];

			if (incomingNodeConnections === undefined) {
				// If it has no incoming data add the default empty data
				incomingData.push([
					{
						json: {}
					}
				]);
			} else {
				// Get the data of the incoming connections
				for (const connections of incomingNodeConnections.main) {
					for (let inputIndex = 0; inputIndex < connections.length; inputIndex++) {
						connection = connections[inputIndex];
						incomingData.push(
							runData[connection.node!][runIndex].data![connection.type][connection.index]!,
						);
					}
				}
			}

			const executeData: IExecuteData = {
				node: workflow.getNode(startNode) as INode,
				data: {
					main: incomingData,
				}
			};

			nodeExecutionStack.push(executeData);

			// Check if the destinationNode has to be added as waiting
			// because some input data is already fully available
			incomingNodeConnections = workflow.connectionsByDestinationNode[destinationNode];
			if (incomingNodeConnections !== undefined) {
				for (const connections of incomingNodeConnections.main) {
					for (let inputIndex = 0; inputIndex < connections.length; inputIndex++) {
						connection = connections[inputIndex];

						if (waitingExecution[destinationNode] === undefined) {
							waitingExecution[destinationNode] = {};
						}
						if (waitingExecution[destinationNode][runIndex] === undefined) {
							waitingExecution[destinationNode][runIndex] = {};
						}
						if (waitingExecution[destinationNode][runIndex][connection.type] === undefined) {
							waitingExecution[destinationNode][runIndex][connection.type] = [];
						}


						if (runData[connection.node!] !== undefined) {
							// Input data exists so add as waiting
							// incomingDataDestination.push(runData[connection.node!][runIndex].data![connection.type][connection.index]);
							waitingExecution[destinationNode][runIndex][connection.type].push(runData[connection.node!][runIndex].data![connection.type][connection.index]);
						} else {
							waitingExecution[destinationNode][runIndex][connection.type].push(null);
						}
					}
				}
			}
		}

		// Only run the parent nodes and no others
		let runNodeFilter: string[] | undefined = undefined;
		runNodeFilter = workflow.getParentNodes(destinationNode);
		runNodeFilter.push(destinationNode);


		const runExecutionData: IRunExecutionData = {
			startData: {
				destinationNode,
				runNodeFilter,
			},
			resultData: {
				runData,
			},
			executionData: {
				contextData: {},
				nodeExecutionStack,
				waitingExecution,
			},
		};

		return await this.runExecutionData(workflow, runExecutionData);
	}



	/**
	 * Executes the hook with the given name
	 *
	 * @param {string} hookName
	 * @param {any[]} parameters
	 * @returns {Promise<IRun>}
	 * @memberof WorkflowExecute
	 */
	async executeHook(hookName: string, parameters: any[]): Promise<void> { // tslint:disable-line:no-any
		if (this.additionalData.hooks === undefined) {
			return parameters[0];
		}
		if (this.additionalData.hooks[hookName] === undefined || this.additionalData.hooks[hookName]!.length === 0) {
			return parameters[0];
		}

		for (const hookFunction of this.additionalData.hooks[hookName]!) {
			await hookFunction.apply(this, parameters as [IRun, IWaitingForExecution])
				.catch((error) => {
					// Catch all errors here because when "executeHook" gets called
					// we have the most time no "await" and so the errors would so
					// not be uncaught by anything.

					// TODO: Add proper logging
					console.error(`There was a problem executing hook: "${hookName}"`);
					console.error('Parameters:');
					console.error(parameters);
					console.error('Error:');
					console.error(error);
				});
		}
	}



	/**
	 * Runs the given execution data.
	 *
	 * @param {Workflow} workflow
	 * @param {IRunExecutionData} runExecutionData
	 * @returns {Promise<string>}
	 * @memberof WorkflowExecute
	 */
	async runExecutionData(workflow: Workflow, runExecutionData: IRunExecutionData): Promise<string> {
		const startedAt = new Date().getTime();

		const workflowIssues = workflow.checkReadyForExecution();
		if (workflowIssues !== null) {
			throw new Error('The workflow has issues and can for that reason not be executed. Please fix them first.');
		}

		// Variables which hold temporary data for each node-execution
		let executionData: IExecuteData;
		let executionError: IExecutionError | undefined;
		let executionNode: INode;
		let nodeSuccessData: INodeExecutionData[][] | null;
		let runIndex: number;
		let startTime: number;
		let taskData: ITaskData;

		if (runExecutionData.startData === undefined) {
			runExecutionData.startData = {};
		}

		this.executionId = this.activeExecutions.add(workflow, runExecutionData, this.mode);

		this.executeHook('workflowExecuteBefore', [this.executionId]);

		let currentExecutionTry = '';
		let lastExecutionTry = '';

		// Wait for the next tick so that the executionId gets already returned.
		// So it can directly be send to the editor-ui and is so aware of the
		// executionId when the first push messages arrive.
		process.nextTick(() => (async () => {
			executionLoop:
			while (runExecutionData.executionData!.nodeExecutionStack.length !== 0) {
				if (this.activeExecutions.shouldBeStopped(this.executionId!) === true) {
					// The execution should be stopped
					break;
				}

				nodeSuccessData = null;
				executionError = undefined;
				executionData = runExecutionData.executionData!.nodeExecutionStack.shift() as IExecuteData;
				executionNode = executionData.node;

				this.executeHook('nodeExecuteBefore', [this.executionId, executionNode.name]);

				// Get the index of the current run
				runIndex = 0;
				if (runExecutionData.resultData.runData.hasOwnProperty(executionNode.name)) {
					runIndex = runExecutionData.resultData.runData[executionNode.name].length;
				}

				currentExecutionTry = `${executionNode.name}:${runIndex}`;

				if (currentExecutionTry === lastExecutionTry) {
					throw new Error('Did stop execution because execution seems to be in endless loop.');
				}

				if (runExecutionData.startData!.runNodeFilter !== undefined && runExecutionData.startData!.runNodeFilter!.indexOf(executionNode.name) === -1) {
					// If filter is set and node is not on filter skip it, that avoids the problem that it executes
					// leafs that are parallel to a selected destinationNode. Normally it would execute them because
					// they have the same parent and it executes all child nodes.
					continue;
				}

				// Check if all the data which is needed to run the node is available
				if (workflow.connectionsByDestinationNode.hasOwnProperty(executionNode.name)) {
					// Check if the node has incoming connections
					if (workflow.connectionsByDestinationNode[executionNode.name].hasOwnProperty('main')) {
						let inputConnections: IConnection[][];
						let connectionIndex: number;

						inputConnections = workflow.connectionsByDestinationNode[executionNode.name]['main'];

						for (connectionIndex = 0; connectionIndex < inputConnections.length; connectionIndex++) {
							if (workflow.getHighestNode(executionNode.name, 'main', connectionIndex).length === 0) {
								// If there is no valid incoming node (if all are disabled)
								// then ignore that it has inputs and simply execute it as it is without
								// any data
								continue;
							}

							if (!executionData.data!.hasOwnProperty('main')) {
								// ExecutionData does not even have the connection set up so can
								// not have that data, so add it again to be executed later
								runExecutionData.executionData!.nodeExecutionStack.push(executionData);
								lastExecutionTry = currentExecutionTry;
								continue executionLoop;
							}

							// Check if it has the data for all the inputs
							// The most nodes just have one but merge node for example has two and data
							// of both inputs has to be available to be able to process the node.
							if (executionData.data!.main!.length < connectionIndex || executionData.data!.main![connectionIndex] === null) {
								// Does not have the data of the connections so add back to stack
								runExecutionData.executionData!.nodeExecutionStack.push(executionData);
								lastExecutionTry = currentExecutionTry;
								continue executionLoop;
							}
						}
					}
				}

				// TODO Has to check if node is disabled

				// Clone input data that nodes can not mess up data of parallel nodes which receive the same data
				// TODO: Should only clone if multiple nodes get the same data or when it gets returned to frontned
				//       is very slow so only do if needed
				startTime = new Date().getTime();

				try {
					runExecutionData.resultData.lastNodeExecuted = executionData.node.name;
					nodeSuccessData = await workflow.runNode(executionData.node, JSON.parse(JSON.stringify(executionData.data)), runExecutionData, runIndex, this.additionalData, NodeExecuteFunctions, this.mode);

					if (nodeSuccessData === null) {
						// If null gets returned it means that the node did succeed
						// but did not have any data. So the branch should end
						// (meaning the nodes afterwards should not be processed)
						continue;
					}

				} catch (error) {
					executionError = {
						message: error.message,
						stack: error.stack,
					};
				}

				// Add the data to return to the user
				// (currently does not get cloned as data does not get changed, maybe later we should do that?!?!)

				if (!runExecutionData.resultData.runData.hasOwnProperty(executionNode.name)) {
					runExecutionData.resultData.runData[executionNode.name] = [];
				}
				taskData = {
					startTime,
					executionTime: (new Date().getTime()) - startTime
				};

				if (executionError !== undefined) {
					taskData.error = executionError;

					if (executionData.node.continueOnFail === true) {
						// Workflow should continue running even if node errors
						if (executionData.data.hasOwnProperty('main') && executionData.data.main.length > 0) {
							// Simply get the input data of the node if it has any and pass it through
							// to the next node
							if (executionData.data.main[0] !== null) {
								nodeSuccessData = [(JSON.parse(JSON.stringify(executionData.data.main[0])) as INodeExecutionData[])];
							}
						}
					} else {
						// Node execution did fail so add error and stop execution
						runExecutionData.resultData.runData[executionNode.name].push(taskData);

						// Add the execution data again so that it can get restarted
						runExecutionData.executionData!.nodeExecutionStack.unshift(executionData);

						this.executeHook('nodeExecuteAfter', [this.executionId, executionNode.name, taskData]);

						break;
					}
				}

				// Node executed successfully. So add data and go on.
				taskData.data = ({
					'main': nodeSuccessData
				} as ITaskDataConnections);

				this.executeHook('nodeExecuteAfter', [this.executionId, executionNode.name, taskData]);

				runExecutionData.resultData.runData[executionNode.name].push(taskData);

				if (runExecutionData.startData && runExecutionData.startData.destinationNode && runExecutionData.startData.destinationNode === executionNode.name) {
					// If destination node is defined and got executed stop execution
					continue;
				}

				// Add the nodes to which the current node has an output connection to that they can
				// be executed next
				if (workflow.connectionsBySourceNode.hasOwnProperty(executionNode.name)) {
					if (workflow.connectionsBySourceNode[executionNode.name].hasOwnProperty('main')) {
						let outputIndex: string, connectionData: IConnection;
						// Go over all the different
						for (outputIndex in workflow.connectionsBySourceNode[executionNode.name]['main']) {
							if (!workflow.connectionsBySourceNode[executionNode.name]['main'].hasOwnProperty(outputIndex)) {
								continue;
							}
							// Go through all the different outputs of this connection
							for (connectionData of workflow.connectionsBySourceNode[executionNode.name]['main'][outputIndex]) {
								if (!workflow.nodes.hasOwnProperty(connectionData.node)) {
									return Promise.reject(new Error(`The node "${executionNode.name}" connects to not found node "${connectionData.node}"`));
								}

								let stillDataMissing = false;

								// Check if node has multiple inputs as then we have to wait for all input data
								// to be present before we can add it to the node-execution-stack
								if (workflow.connectionsByDestinationNode[connectionData.node]['main'].length > 1) {
									// Node has multiple inputs

									// Check if there is already data for the node
									if (runExecutionData.executionData!.waitingExecution.hasOwnProperty(connectionData.node) && runExecutionData.executionData!.waitingExecution[connectionData.node][runIndex] !== undefined) {
										// There is already data for the node and the current run so
										// add the new data
										if (nodeSuccessData === null) {
											runExecutionData.executionData!.waitingExecution[connectionData.node][runIndex].main[connectionData.index] = null;
										} else {
											runExecutionData.executionData!.waitingExecution[connectionData.node][runIndex].main[connectionData.index] = nodeSuccessData[outputIndex];
										}

										// Check if all data exists now
										let thisExecutionData: INodeExecutionData[] | null;
										let allDataFound = true;
										for (let i = 0; i < runExecutionData.executionData!.waitingExecution[connectionData.node][runIndex].main.length; i++) {
											thisExecutionData = runExecutionData.executionData!.waitingExecution[connectionData.node][runIndex].main[i];
											if (thisExecutionData === null) {
												allDataFound = false;
												break;
											}
										}

										if (allDataFound === true) {
											// All data exists for node to be executed
											// So add it to the execution stack
											runExecutionData.executionData!.nodeExecutionStack.push({
												node: workflow.nodes[connectionData.node],
												data: runExecutionData.executionData!.waitingExecution[connectionData.node][runIndex]
											});

											// Remove the data from waiting
											delete runExecutionData.executionData!.waitingExecution[connectionData.node][runIndex];

											if (Object.keys(runExecutionData.executionData!.waitingExecution[connectionData.node]).length === 0) {
												// No more data left for the node so also delete that one
												delete runExecutionData.executionData!.waitingExecution[connectionData.node];
											}
											continue;
										} else {
											stillDataMissing = true;
										}
									} else {
										stillDataMissing = true;
									}
								}

								// Make sure the array has all the values
								const connectionDataArray: Array<INodeExecutionData[] | null> = [];
								for (let i: number = connectionData.index; i >= 0; i--) {
									connectionDataArray[i] = null;
								}

								// Add the data of the current execution
								if (nodeSuccessData === null) {
									connectionDataArray[connectionData.index] = null;
								} else {
									connectionDataArray[connectionData.index] = nodeSuccessData[outputIndex];
								}

								if (stillDataMissing === true) {
									// Additional data is needed to run node so add it to waiting
									if (!runExecutionData.executionData!.waitingExecution.hasOwnProperty(connectionData.node)) {
										runExecutionData.executionData!.waitingExecution[connectionData.node] = {};
									}
									runExecutionData.executionData!.waitingExecution[connectionData.node][runIndex] = {
										main: connectionDataArray
									};
								} else {
									// All data is there so add it directly to stack
									runExecutionData.executionData!.nodeExecutionStack.push({
										node: workflow.nodes[connectionData.node],
										data: {
											main: connectionDataArray
										}
									});
								}

							}
						}
					}
				}
			}
			return Promise.resolve();
		})()
		.then(async () => {
			const fullRunData: IRun = {
				data: runExecutionData,
				mode: this.mode,
				startedAt,
				stoppedAt: new Date().getTime(),
			};

			if (executionError !== undefined) {
				fullRunData.data.resultData.error = executionError;
			} else {
				fullRunData.finished = true;
			}

			this.activeExecutions.remove(this.executionId!, fullRunData);

			await this.executeHook('workflowExecuteAfter', [fullRunData, this.executionId!]);

			return fullRunData;
		})
		.catch(async (error) => {
			const fullRunData: IRun = {
				data: runExecutionData,
				mode: this.mode,
				startedAt,
				stoppedAt: new Date().getTime(),
			};

			fullRunData.data.resultData.error = {
				message: error.message,
				stack: error.stack,
			};

			this.activeExecutions.remove(this.executionId!, fullRunData);

			await this.executeHook('workflowExecuteAfter', [fullRunData, this.executionId!]);

			return fullRunData;
		}));

		return this.executionId;
	}
}
