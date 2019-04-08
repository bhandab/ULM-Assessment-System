import React, {Component} from 'react'
import { connect } from "react-redux";
import PropTypes from 'prop-types';
import EvaluatorLayout from '../layouts/EvaluatorLayout';


class Evaluator extends Component {


    componentDidMount() {
        if (!this.props.auth.isAuthenticated || this.props.auth.user.role !== "evaluator") {
            this.props.history.push('/login')
        }
    }

    render (){
        return(
            <EvaluatorLayout/>
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
