import React, {Component, Fragment} from 'react'
import { connect } from "react-redux";
import PropTypes from 'prop-types';
import {Route} from 'react-router-dom';
import EvaluatorLayout from '../layouts/EvaluatorLayout';
import Evaluate from '../evaluator/Evaluate';


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
                <Route path="/evaluator/evaluate" component ={Evaluate}/>
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
