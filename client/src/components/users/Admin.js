import React, { Component, Fragment } from 'react';
import { Route} from 'react-router-dom';

//import './Style.css'

import AdminLayout from '../layouts/AdminLayout'
//import CreateRubric from '../../rubrics/CreateRubric'
import Outcomes from '../contents/Outcomes'
import Measures from '../contents/Measures'
import AssessmentCycle from "../assess-cycle/AssessmentCycle";
import CycleMeasures from "../assess-cycle/CycleMeasures"


class Admin extends Component {

    render() {



        return (

            <Fragment>
                <AdminLayout></AdminLayout>

                <main>
                    <Route exact path ='/admin/outcomes' component={Outcomes} />
                    <Route path = '/admin/measures' component={Measures} />
                    <Route exact path = '/admin/cycles' component = {AssessmentCycle}/>
                   
                    <Route path = {'/admin/cycles/' + localStorage.getItem("outcomeID")} component = {CycleMeasures} />
                </main>
            </Fragment>



        )

    }
}

export default Admin