import * as React from 'react';
import {CaloriesState} from "../../state";
import {history} from '../../util';
import * as _ from 'lodash';
import cxs from 'cxs';
import {generatePushID} from '../../db/util';
import DayPicker from 'react-day-picker';
import * as moment from 'moment';
import 'react-day-picker/lib/style.css';
import InlineText from '../InlineText';
import ScrollArea from '../ScrollArea';
import * as Plot from 'react-plotly.js'
import {Button} from '@blueprintjs/core';
import {ConsumedFoodsList} from './ConsumedFoodsList';
import {Calendar} from './Calendar';
import {WeightForm} from './WeightForm';
import {CaloriesPercentage} from './CaloriesPercentage';
import {WeightPlot} from './WeightPlot';
import {CaloriesPlot} from './CaloriesPlot';
import { AddFoodDialog } from './AddFoodDialog';
import {SettingsDialog} from './SettingsDialog';

type Props = {
    caloriesState: CaloriesState;
}

const plotBackground = "#FFF";

type State = {
    selectedDay: Date;
    showAddFoodDialog: boolean;
    search: string;
    showSettingsDialog: boolean;
}

export default class CaloriesPage extends React.Component<Props,State> {

    state = {
        selectedDay: new Date(),
        showAddFoodDialog: false,
        search: '',
        showSettingsDialog: false
    };


    render() {
        let classes = "left-column";
        if(this.state.showAddFoodDialog){
            classes += " hide-shadow";
        }
        const caloriesState = this.props.caloriesState;
        let day = moment(this.state.selectedDay).format("MM/DD/YY");
        const dayObj = _.find(caloriesState.days, (d: Day) => d.date === day);
        if(!dayObj){
            _.defer(() => {
                this.props.caloriesState.days.push({
                    id: generatePushID(),
                    date: day,
                    weight: 0,
                    consumed: []
                });
            });
            return <div />;
        }
        return (
            <div className="calories-page pt-card pt-elevation-3">
                <div className={classes}>
                    <Calendar selectedDay={this.state.selectedDay}
                        days={caloriesState.days}
                        weightStasisGoal={caloriesState["calorie-settings"].weightStasisGoal}
                        onChange={this.onDateChanged} />
                    <WeightForm caloriesState={caloriesState} selectedDay={this.state.selectedDay} />
                    <ConsumedFoodsList day={dayObj} onToggleAddFood={this.onToggleAddFood}/>
                    <CaloriesPercentage caloriesState={caloriesState} selectedDay={this.state.selectedDay} onOpenSettings={this.onOpenSettings} />
                </div>
                <div className="right-column">
                    <div className="graphs">
                        <WeightPlot caloriesState={this.props.caloriesState} />
                        <CaloriesPlot caloriesState={this.props.caloriesState} />
                    </div>
                    <AddFoodDialog days={this.props.caloriesState.days}
                            foodDefinitions={this.props.caloriesState.foodDefinitions}
                            selectedDay={this.state.selectedDay}
                            visible={this.state.showAddFoodDialog}
                            onClose={this.onCloseFoodDialog} />
                    <SettingsDialog
                         caloriesState={this.props.caloriesState}
                         visible={this.state.showSettingsDialog}
                         onClose={this.onOpenSettings} />
                </div>
            </div>
        );
    }

    private onOpenSettings = () => {
        this.setState({
            showAddFoodDialog: false,
            showSettingsDialog: !this.state.showSettingsDialog
        });
    }

    private onDateChanged = (newDate) => {
        let day = moment(newDate).format("MM/DD/YY");
        const dayObj = _.find(this.props.caloriesState.days, (d: Day) => d.date === day);
        if(_.isUndefined(dayObj)){
            this.props.caloriesState.days.push({
                id: generatePushID(),
                date: day,
                weight: 0,
                consumed: []
            });
        }
        this.setState({
            selectedDay: newDate
        });
    }

    private onToggleAddFood = () => {
        this.setState({
            showAddFoodDialog: !this.state.showAddFoodDialog,
            showSettingsDialog: false
        });
    }

    private onCloseFoodDialog = () => {
        this.setState({
            showAddFoodDialog: false,
            showSettingsDialog: false
        });
    }

    onChangeDate = (newDate: string) => {
        this.props.caloriesState.set({selectedDate: newDate});
    }
}
