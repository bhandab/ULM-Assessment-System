import React, { Component, Fragment } from 'react';
import {getOutcomesMeasures, linkMeasureToOutcome} from "../../actions/assessmentCycleAction";
import {getMeasures} from "../../actions/measuresAction";
import PropTypes from 'prop-types';
import { connect } from 'react-redux';




class OutcomeMeasures extends Component {

    state = {
        addMeasures: false,
        cycleID: "",
        outcomeID:""
    }

    componentDidMount(){
        const path = this.props.match.url
        const cycleID = parseInt(path.substr(path.length - 3), 10)
        const outcomeID = parseInt(this.props.match.params.id, 10)
        this.props.getOutcomesMeasures(cycleID, outcomeID)
        this.setState({ cycleID: cycleID, outcomeID: outcomeID})
        
        
    }

    clickHandler = (e) => {
        e.preventDefault()

        if (!this.state.addMeasures) {
            this.props.getMeasures()
        }
        this.setState({ addMeasures: !this.state.addOutcomes })

    }

    measureAddHandler = (e) => {
        e.preventDefault();
        console.log(e.target.measures.value)
        this.props.linkMeasureToOutcome(this.state.cycleID,this.state.outcomeID,e.target.measures.value)
        window.location.reload()

    }

    render(){
        console.log(this.props)
        let measures = <p>Loading!!!</p>
        let measureTitle = null
        if(this.props.cycles.outcomeMeasures !== null){
            if (Object.keys(this.props.cycles.outcomeMeasures).length > 1){
            if (this.props.cycles.outcomeMeasures.measures.length > 0){
                measures = this.props.cycles.outcomeMeasures.measures.map(measure => {
                    return (<li key={measure.measureID}>{measure.measureName}</li>)
                })
                measureTitle = this.props.cycles.outcomeMeasures.outcomeName
            }
            
            else{
                measures = <p>No measures present for this outcome</p>
            }
        }
            //console.log(measures)
        }

        let selections = null
        if (this.state.addMeasures) {
            if (Object.keys(this.props.measures).length > 0) {
                console.log(this.props)
                if (this.props.measures.measures !== null) {
                    selections = this.props.measures.measures.map(item => {
                        return (<option key={item.measureID} value={item.measureID}>
                            {item.measureDescription}
                        </option>)
                    })
                }
            }
        }
        
        return(

            <Fragment>
            <section className = "panel important">
                <h2>{measureTitle}</h2>
                <ol>{measures}</ol>
            </section>

            <section className="panel important">
                <button onClick={this.clickHandler.bind(this)} className="btn btn-primary btn-sm">Add Measures</button>
                {(this.state.addMeasures) ?
                    <div>
                        <br></br>
                        <h4>Please Select Measure(s):</h4>
                        <form onSubmit={this.measureAddHandler.bind(this)}>
                            <select name="measures">{selections}</select>
                            <br></br>
                            <br></br>
                            <button type="submit" className="btn btn-outline-primary btn-sm" value="submit">Submit</button>
                        </form>
                    </div>
                    : null}

            </section>
            </Fragment>
           
        )
    }

}

OutcomeMeasures.propTypes = {
    getOutcomesMeasures: PropTypes.func.isRequired,
    getMeasures: PropTypes.func.isRequired,
    linkMeasureToOutcome: PropTypes.func.isRequired
}

const MapStateToProps = state => ({
    outcomeMeasures: state.outcomeMeasures,
    cycles: state.cycles,
    measures: state.measures

})


export default connect(MapStateToProps, 
    {getOutcomesMeasures, getMeasures, linkMeasureToOutcome})
(OutcomeMeasures);