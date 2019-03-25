import React, { Component, Fragment } from 'react';
import { Route, withRouter } from 'react-router-dom';

//import './Style.css'

import AdminLayout from '../layouts/AdminLayout'
//import CreateRubric from '../../rubrics/CreateRubric'
import Outcomes from '../contents/Outcomes'
import Measures from '../contents/Measures'
import AssessmentCycle from "../assess-cycle/AssessmentCycle";


class Admin extends Component {

    render() {



        return (

            <Fragment>
                <AdminLayout></AdminLayout>

                <main>
                    <Route exact path ='/admin/outcomes' component={Outcomes} />
                    <Route path = '/admin/measures' component={Measures} />
                    <Route path = '/admin/cycles' component = {AssessmentCycle} />
                </main>
            </Fragment>



        )

    }
}

export default withRouter(Admin)