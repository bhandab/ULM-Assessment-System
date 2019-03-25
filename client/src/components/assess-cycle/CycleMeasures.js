import React, { Component, Fragment } from 'react';
import { getCycleMeasures, linkOutcomeToCycle } from '../../actions/assessmentCycleAction';
import { getOutcomes} from '../../actions/outcomesAction'
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
//import Measures from '../contents/Measures';


class CycleMeasures extends Component {

    state = {
        addOutcomes: false
    }

    componentDidMount() {

        let id = localStorage.getItem("outcomeID")
        this.props.getCycleMeasures(id) //measures means outcomes
        //console.log(this.props)

    }

    clickHandler = (e) => {
        e.preventDefault()
        this.setState({ addOutcomes: !this.state.addOutcomes })
        //console.log("turn on select mesasures")
        if (!this.state.addOutcomes) {
            console.log("Outcomes fetched")
            this.props.getOutcomes()
        }
        
    }

    measureAddHandler = (e) => {
        e.preventDefault();
        console.log(e.target.outcomes.value)
        this.props.linkOutcomeToCycle(localStorage.getItem("cycleID"), e.target.outcomes.value)
        window.location.reload()
        
    }

    render() {
        console.log(this.props)

        let list = <p>Loading!!</p>

        if (this.props.cycles.cycleMeasures !== null) {
            if (this.props.cycles.cycleMeasures.outcomes.length > 0) {
                list = this.props.cycles.cycleMeasures.outcomes.map(outcome => {
                    return (<li key={outcome.outcomeID}>{outcome.outcomeName}</li>)
                })
            }

            else {
                list = <p>No Outcomes Present.</p>
            }
        }

        let selections = null
        if (this.state.addOutcomes) {
            if (Object.keys(this.props.outcomes.outcomes) !== 0) {
                console.log("entered here")
                if (this.props.outcomes.outcomes.length > 0) {
                    selections = this.props.outcomes.outcomes.map(item => {
                        console.log("list manipulated")
                        return (<option  key={item.outcomeID} value={item.outcomeID}>{item.outcomeDescription}</option>)
                    })
                }
            }
        }
        else{
            console.log("Got fucked")
        }
        return (
            <Fragment>
                <section className="panel important">
                    <h2>{this.props.location.state.name}</h2>
                    <ol>{list}</ol>
                </section>

                <section className="panel important">
                    <button onClick={this.clickHandler.bind(this)} className="btn btn-primary">Add Measures</button>
                    {(this.state.addOutcomes) ?
                        <div>
                            <br></br>
                            <h4>Please Select Measure(s):</h4>
                                <form onSubmit={this.measureAddHandler.bind(this)}>
                                 <select name="outcomes">{selections}</select>
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

CycleMeasures.propTypes = {
    getCycleMeasures: PropTypes.func.isRequired,
    getOutcomes: PropTypes.func.isRequired,
    linkOutcomeToCycle: PropTypes.func.isRequired,
    auth: PropTypes.object.isRequired

    //getAssessmentCycles: PropTypes.func.isRequired
}

const mapStateToProps = state => ({
    auth: state.auth,
    cycleMeasures: state.cycleMeasures,
    cycles: state.cycles,
    outcomes: state.outcomes
})

export default connect(mapStateToProps, { getCycleMeasures, getOutcomes, linkOutcomeToCycle })(CycleMeasures);