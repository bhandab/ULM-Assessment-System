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
        let measures = <p>Loading!!!</p>
        let measureTitle = null
        if(this.props.cycles.outcomeMeasures !== null){
            if (this.props.cycles.outcomeMeasures.measures.length > 0){
                measures = this.props.cycles.outcomeMeasures.measures.map(measure => {
                    return (<li key={measure.measureID}>{measure.measureName}</li>)
                })
            }
            else{
                measures = <p>No measures present for this outcome</p>
            }
        }

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