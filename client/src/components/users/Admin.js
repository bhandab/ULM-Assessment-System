import React, { Component, Fragment } from 'react';
import { Route, withRouter } from 'react-router-dom';

//import './Style.css'

import AdminLayout from '../layouts/AdminLayout'
import CreateRubric from '../../rubrics/CreateRubric'
import Outcomes from '../contents/Outcomes'
import PerfMeasures from '../contents/PerfMeasures'


class Admin extends Component {

    render() {



        return (

            <Fragment>
                <AdminLayout></AdminLayout>
                
                <main>
                    <section className = "panel important">
                        <Route path = '/admin/rubrics' component={CreateRubric} />
                        
                    </section>
                    <Route path = '/admin/outcomes' component = {Outcomes}/>
                    <Route path="/admin/perf-measures" component = {PerfMeasures}/>
                </main>
            </Fragment>



        )

    }
}

export default withRouter(Admin)