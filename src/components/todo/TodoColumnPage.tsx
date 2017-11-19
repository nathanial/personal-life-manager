import * as React from 'react';
import * as _ from 'lodash';
import TodoColumnView from "./TodoColumnView";
import TodoColumnSettingsPage from "./TodoColumnSettingsPage";
import cxs from 'cxs';
import {DragAndDropLayer} from "../dnd/DragAndDropLayer";

const todoColumnPageClass = cxs({
    display: 'block',
    'text-align': 'left',
    position: 'absolute',
    left: 0,
    right: 0,
    top: '15px',
    bottom: 0,
    padding: '0',
    'white-space': 'nowrap'
});

const columnsContainerClass = cxs({
    width: '100%',
    height: '100%',
    'overflow-x': 'auto',
    padding: '0 20px'
});

type Props = {
    todoColumns: TodoColumn[];
    showDevTools: boolean;
}

export default class TodoColumnPage extends React.PureComponent<Props> {
    render(){
        let {todoColumns, showDevTools} = this.props;
        todoColumns = _.sortBy(todoColumns, column => column.index);
        return (
            <div className={todoColumnPageClass}>
                <div className={columnsContainerClass}>
                    {_.map(todoColumns, (column) => {
                        return <TodoColumnView key={column.id} column={column} onDeleteColumn={this.onDeleteColumn} />
                    })}
                </div>
                <DragAndDropLayer />
            </div>
        );
    }

    onDeleteColumn = (column) => {
        this.props.todoColumns.splice(_.findIndex(this.props.todoColumns, c => c.id === column.id), 1);
    }


}