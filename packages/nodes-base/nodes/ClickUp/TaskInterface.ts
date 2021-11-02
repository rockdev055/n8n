export interface ITask {
	name?: string;
	content?: string;
	assignees?: string[];
	tags?: string[];
	status?: string;
	priority?: number;
	due_date?: number;
	due_date_time?: boolean;
	time_estimate?: number;
	start_date?: number;
	start_date_time?: boolean;
	markdown_content?: string;
	notify_all?: boolean;
	parent?: string;
}
