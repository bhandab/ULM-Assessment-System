import React, {Component} from 'react';
import {getCycleMeasures, getAssessmentCycles} from '../../actions/assessmentCycleAction';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';


class CycleMeasures extends Component {

    componentDidMount() {
        
        let id = localStorage.getItem("outcomeID")
        this.props.getCycleMeasures(id)
        //console.log(this.props)

    }

    render(){
        console.log(this.props)

        let list = <p>Loading!!</p>
        
        if(this.props.cycles.cycleMeasures !== null){
            if (this.props.cycles.cycleMeasures.outcomes.length > 0){
            list = this.props.cycles.cycleMeasures.outcomes.map(outcome =>{
                return(<li key={outcome.outcomeID}>{outcome.outcomeName}</li>)
            })}

            else{
                list = <p>No Outcomes Present.</p>
            }
        }
        return(
            <section className="panel important">
            <h2>{this.props.location.state.name}</h2>
            <ol>{list}</ol>
            </section>
            
        )

    }

}

CycleMeasures.propTypes = {
    getCycleMeasures: PropTypes.func.isRequired,
    auth: PropTypes.object.isRequired,
    getAssessmentCycles: PropTypes.func.isRequired
}

const mapStateToProps = state => ({
    auth: state.auth,
    cycleMeasures: state.cycleMeasures,
    cycles: state.cycles
})

export default connect(mapStateToProps, { getCycleMeasures, getAssessmentCycles})(CycleMeasures);