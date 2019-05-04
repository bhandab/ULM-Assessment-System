import React, {Component, Fragment} from 'react'
import { connect } from "react-redux";
import PropTypes from 'prop-types';
import {Route} from 'react-router-dom';
import EvaluatorLayout from '../layouts/EvaluatorLayout';
import Evaluate from '../evaluator/Evaluate';
import Logs from '../evaluator/Logs';
import Profile from '../profiles/EvaluatorProfile'


class Evaluator extends Component {


    componentDidMount() {
        if (!this.props.auth.isAuthenticated || this.props.auth.user.role !== "evaluator") {
            this.props.history.push('/login')
        }
    }

    render (){
        return(
            <Fragment>
            <EvaluatorLayout/>

            <main>
                <Route exact path = "/evaluator/profile" component={Profile} />
                <Route exact path = "/evaluator/logs" component ={Logs} /> 
                <Route exact path= "/evaluator/evaluate" component ={Evaluate}/>
            </main>
            </Fragment>
            
        )
    }
} 

Evaluator.propTypes = {
    auth: PropTypes.object.isRequired
}

const MapStateToProps = state => ({
    auth: state.auth
})

export default connect(MapStateToProps)(Evaluator)
