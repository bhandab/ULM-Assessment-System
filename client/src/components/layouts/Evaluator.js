
import React, { Component, Fragment } from 'react';
import {  Link } from 'react-router-dom';

import './Style.css'

//import CreateRubric from '../../rubrics/CreateRubric'

class Evaluator extends Component {


    render() {

        console.log(this.props)

        return (
            <Fragment>
                <header>
                    <h1>Evaluator Panel</h1>
                    <ul className="utilities">
                        <li className="users"><Link to="#">My Account</Link></li>
                        <li className="logout warn"><Link to="/">Log Out</Link></li>
                    </ul>
                </header>


                <nav>
                    <ul className="main">
                        <li className="dashboard"><Link to="admin/dashboard">Dashboard</Link></li>
                        <li className="rubrics"><Link to="/evaluator/rubrics">Rubrics</Link></li>
                        <li className="assess-cycle"><Link to="admin/students">Student</Link></li>
                        <li className="assess-cycle"><Link to="admin/evaluate">Evaluate</Link></li>
                    </ul>
                </nav>

                <main>
                    <section className="panel important">

                       
                    </section>
                </main>
            </Fragment>
        )
    }
}

export default Evaluator

