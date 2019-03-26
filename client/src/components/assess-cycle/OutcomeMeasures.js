import React, { Component, Fragment } from 'react';
import {getOutcomesMeasures} from "../../actions/assessmentCycleAction";
import PropTypes from 'prop-types';
import { connect } from 'react-redux';




class OutcomeMeasures extends Component {

    componentDidMount(){
        const path = this.props.match.url
        const cycleID = parseInt(path.substr(path.length - 3), 10)
        const outcomeID = parseInt(this.props.match.params.id, 10)
        this.props.getOutcomesMeasures(cycleID, outcomeID)
        
    }

    render(){
        console.log(this.props)
        return(
            <section>
                <p>Outcome Measures</p>
            </section>
           
        )
    }

}

OutcomeMeasures.propTypes = {
    getOutcomesMeasures: PropTypes.func.isRequired
}

const MapStateToProps = state => ({
    outcomeMeasures: state.outcomeMeasures,
    cycles: state.cycles

})


export default connect(MapStateToProps, 
    {getOutcomesMeasures})
(OutcomeMeasures);