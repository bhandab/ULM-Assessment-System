import React, { Component, Fragment } from 'react';
import { Route, Switch } from 'react-router-dom';

import AdminLayout from '../layouts/AdminLayout';
import Outcomes from '../contents/Outcomes';
import Measures from '../contents/Measures';
import AssessmentCycle from "../assess-cycle/AssessmentCycle";
import CycleMeasures from "../assess-cycle/CycleMeasures";
import OutcomeMeasures from '../assess-cycle/OutcomeMeasures';
import CreateRubric from '../rubrics/CreateRubric';

class Admin extends Component {

    render() {

        return (

            <Fragment>
                <AdminLayout></AdminLayout>

                <main>
                    <Switch>
                        <Route exact path='/admin/outcomes' component={Outcomes} />
                        <Route exact path='/admin/measures' component={Measures} />
                        <Route path='/admin/cycles/cycle/:cycleID(\d+)/outcomes/:outcomeID(\d+)/rubric/:rubricID(\d+)' component={CreateRubric} />
                        <Route path='/admin/cycles/cycle/:cycleID(\d+)/outcomes/:outcomeID(\d+)' component={OutcomeMeasures} />
                        <Route path='/admin/cycles/cycle/:id(\d+)' component={CycleMeasures} />
                        <Route path='/admin/cycles' component={AssessmentCycle} />
                    </Switch>

                </main>
            </Fragment>
        )

    }
}

export default Admin