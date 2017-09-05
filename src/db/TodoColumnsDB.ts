import * as _ from 'lodash';
import * as firebase from "firebase/app";
import {downloadCollection} from "./util";
import {state} from '../state';
import Database = firebase.database.Database;
import Reference = firebase.database.Reference;
import * as uuidv4 from 'uuid/v4';
import * as Freezer from 'freezer-js';

type MoveTodoOptions = {
	index: number;
}

function encode(columns: TodoColumn[]) {
	const copy = _.cloneDeep(columns);
	const result = {};
	for(let column of copy){
		result[column.id] = _.omit(column, ['id', 'todos']);
		result[column.id].todos = {};
		for(let todo of column.todos){
			result[column.id].todos[todo.id] = _.omit(todo, ['id']);
		}
	}
	return result;
}

export default class TodoColumnsDB implements DBSection {
	todoColumnsRef: Reference;

	private dirtyColumns: string[] = [];
	private deletedColumns: string[] = [];

	constructor(private readonly db: Database) {

	}

	async setup() {
		const user = firebase.auth().currentUser;
		const userId = user.uid;

		this.todoColumnsRef = this.db.ref(`/users/${userId}/todoColumns`);
		const todoColumns = await downloadCollection<TodoColumn>(this.todoColumnsRef);
		for(let todoColumn of todoColumns){
			if(_.isEmpty(todoColumn.todos)){
				todoColumn.todos = [];
			}
		}
		state.set({todoColumns: todoColumns});

		setTimeout(() => {
			state.on('update', (currentState, prevState) => {
				for(let prevColumn of prevState.todoColumns){
					if(!_.some(currentState.todoColumns, c => c.id === prevColumn.id)){
						this.deletedColumns.push(prevColumn.id);
					}
				}
				for(let currentColumn of currentState.todoColumns){
					if(!_.some(prevState.todoColumns, prevColumn => prevColumn === currentColumn)){
						this.dirtyColumns.push(currentColumn.id);						
					}
				}
			})
		}, 500);

		setInterval(() => {
			const todoColumns = state.get().todoColumns;
			for(let columnID of _.uniq(this.dirtyColumns)){
				const column = _.find(todoColumns, c => c.id === columnID);
				this.todoColumnsRef.child(columnID).set(_.omit(column, 'id'));
			}
			for(let columnID of _.uniq(this.deletedColumns)){
				this.todoColumnsRef.child(columnID).remove();
			}
			this.dirtyColumns = [];
			this.deletedColumns = [];
		}, 1000);
	}
}