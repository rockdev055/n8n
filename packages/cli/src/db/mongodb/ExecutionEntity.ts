import {
	WorkflowExecuteMode,
} from 'n8n-workflow';

import {
	IExecutionFlattedDb,
	IWorkflowDb,
} from '../../';

import {
	Column,
	Entity,
	Index,
	ObjectID,
	ObjectIdColumn,
 } from "typeorm";

@Entity()
export class ExecutionEntity implements IExecutionFlattedDb {

	@ObjectIdColumn()
	id: ObjectID;

	@Column()
	data: string;

	@Column()
	finished: boolean;

	@Column()
	mode: WorkflowExecuteMode;

	@Column()
	retryOf: string;

	@Column()
	retrySuccessId: string;

	@Column()
	startedAt: number;

	@Column()
	stoppedAt: number;

	@Column('json')
	workflowData: IWorkflowDb;

	@Index()
	@Column()
	workflowId: string;
}
