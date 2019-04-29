import React, { Component, Fragment } from 'react';
import { Route, Switch } from 'react-router-dom';
import { connect } from "react-redux";
import PropTypes from 'prop-types';
import AdminLayout from '../layouts/AdminLayout';
import Outcomes from '../contents/Outcomes';
import Measures from '../contents/Measures';
import AssessmentCycle from "../assess-cycle/AssessmentCycle";
import CycleMeasures from "../assess-cycle/CycleMeasures";
import OutcomeMeasures from '../assess-cycle/OutcomeMeasures';
import CreateRubric from '../rubrics/CreateRubric';
import AllRubrics from '../rubrics/AllRubrics';
import MeasureDetails from '../assess-cycle/MeasureDetails';
import Evaluators from '../contents/Evaluators';
// import MeasureReport from '../assess-cycle/MeasureReport';
import CoordinatorProfile from '../profiles/CoordinatorProfile';
import OutcomeReport from '../reports/OutcomeReport';
import CycleReport from '../reports/CycleReport';
import RubricReport from '../reports/RubricReport';
import TestReport from '../reports/TestReport';
import PastCycles from '../contents/PastCycles';
import Dashboard from '../dashboard/Dashboard';
import Logs from '../contents/Logs';


class Admin extends Component {

    componentDidMount(){
        if (!this.props.auth.isAuthenticated || this.props.auth.user.role !== "coordinator"){
            this.props.history.push('/login')
        }
    }
    render() {
        //console.log("admin")
       // console.log(this.props)
        return (

            <Fragment>
                <AdminLayout></AdminLayout>

                <main id="main">
                    <Switch>
                        <Route exact path='/admin/cycles/cycle/:cycleID(\d+)/report' component={CycleReport} />
                        <Route exact path="/admin/cycles/cycle/:cycleID(\d+)/outcome/:outcomeID(\d+)/report" component={OutcomeReport}/>
                        <Route exact path="/admin/measure/:measureID(\d+)/report" component={RubricReport}/>
                        <Route exact path="/admin/measure/:measureID(\d+)/testReport" component={TestReport}/>
                        <Route exact path='/admin/rubrics' component={AllRubrics} />
                        <Route exact path='/admin/outcomes' component={Outcomes} />
                        <Route exact path='/admin/measures' component={Measures} />
                        <Route exact path="/admin/evaluators" component ={Evaluators} />
                        <Route exact path='/admin/rubrics/:rubricID(\d+)' component={CreateRubric}/>
                        <Route exact path='/admin/profile' component={CoordinatorProfile}/>
                        <Route exact path='/admin/cycles/cycle/:cycleID(\d+)/outcomes/:outcomeID(\d+)/measures/:measureID(\d+)' component={MeasureDetails}/>
                        <Route exact path='/admin/cycles/cycle/:cycleID(\d+)/outcomes/:outcomeID(\d+)/rubric/:rubricID(\d+)' component={CreateRubric} />
                        <Route exact path='/admin/cycles/cycle/:cycleID(\d+)/outcomes/:outcomeID(\d+)' component={OutcomeMeasures} />
                        <Route exact path='/admin/cycles/cycle/:cycleID(\d+)' component={CycleMeasures} />
                        <Route exact path='/admin/cycles' component={AssessmentCycle}/>
                        <Route exact path='/admin/pastCycles' component={PastCycles}/>
                        <Route exact path='/admin/dashboard' component={Dashboard}/>
                        <Route  path = '/admin/logs' component={Logs} /> 
                    </Switch>

                </main>
            </Fragment>
        )

    }
}

Admin.propTypes = {
    auth: PropTypes.object.isRequired
}

const MapStateToProps = state => ({
    auth: state.auth
})

export default connect(MapStateToProps)(Admin)