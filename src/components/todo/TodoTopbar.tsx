import * as React from 'react';
import {Button} from '@blueprintjs/core';
import {db} from "../../util";
import cxs from 'cxs';
import {state} from "../../state";
import * as FileSaver from 'file-saver';

const todoTopbarClass = cxs({
	margin: '10px 30px',
	display: 'inline-block'
});

const importButtonClass = cxs({
});

const exportButtonClass = cxs({
	marginLeft: '10px',
	marginRight: '10px'
});

const devtoolsClass = cxs({
	display: 'inline-block',
	margin: '0 10px'
});

export default class TodoTopbar extends React.Component<{},{}> {
	private fileInput: HTMLInputElement;

	render(){
		return (
			<div className={`${todoTopbarClass}`}>
				<Button className="add-column-btn pt-intent-success"
						iconName="plus"
						onClick={this.onAddColumn}>
					Add Column
				</Button>
				{this.renderDevTools()}
			</div>
		);
	}

	renderDevTools = () => {
		const showDevTools = state.get().showDevTools;
		if(!showDevTools){
			return;
		}
		return (
			<div className={devtoolsClass}>
				<Button className={importButtonClass}
						onClick={this.onImportTodos}>
					Import
					<input type="file" ref={(fileInput) => this.fileInput = fileInput}
						   style={{display: 'none'}}
						   onChange={this.onFileInputChanged}/>
				</Button>
				<Button className={exportButtonClass}
						onClick={this.onExportTodos}>
					Export
				</Button>
				<Button onClick={this.onDeleteTodos}>
					Delete All
				</Button>
			</div>
		);
	};

	componentDidMount(){
		document.addEventListener('keydown', this.onKeyDown);
	}

	componentWillUnmount(){
		document.removeEventListener('keydown', this.onKeyDown);
	}

	private onFileInputChanged = () =>{
		const file = this.fileInput.files[0];
		const reader = new FileReader();
		reader.onload = (e: any) => {
			const contents = e.target.result;
			const todos = JSON.parse(contents);
			db.todoColumnsDB.reset(todos)
		};
		reader.readAsText(file);
		console.log("File Input Changed", this.fileInput.files[0]);
	}

	private onImportTodos = () => {
		this.fileInput.click();
	};

	private onExportTodos = () => {
		const blob = new Blob([
			[JSON.stringify(db.todoColumnsDB.todoColumns, undefined, 4)]
		], {type: 'application/json;charset=utf-8'})
		FileSaver.saveAs(blob, 'todos.json');
	};

	private onDeleteTodos = () => {
		db.todoColumnsDB.reset([]);
	}

	private onKeyDown = (event) => {
		const appState = state.get();
		if(event.keyCode === 192 && event.ctrlKey){
			appState.set('showDevTools', !appState.showDevTools);
		}
	};

	private onAddColumn = () => {
		db.todoColumnsDB.addTodoColumn('New Column');
	};
}