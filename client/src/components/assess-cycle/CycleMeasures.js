import React, { Component, Fragment } from 'react';
import { getCycleMeasures, linkOutcomeToCycle } from '../../actions/assessmentCycleAction';
import { getOutcomes } from '../../actions/outcomesAction';
import { Link } from 'react-router-dom'
import { connect } from 'react-redux';
import PropTypes from 'prop-types';


class CycleMeasures extends Component {

    state = {
        addOutcomes: false
    }

    componentDidMount() {

        let id = this.props.match.params.id;
        this.props.getCycleMeasures(id)

    }


    clickHandler = (e) => {
        e.preventDefault()
        
        if (!this.state.addOutcomes) {
            this.props.getOutcomes()
       }
        this.setState({ addOutcomes: !this.state.addOutcomes })

    }

    measureAddHandler = (e) => {
        e.preventDefault();
        this.props.linkOutcomeToCycle(localStorage.getItem("cycleID"), e.target.outcomes.value)
        window.location.reload()

    }

    render() {

        let title = null
        let list = <p>Loading!!</p>
        
        console.log(this.props)
        if (this.props.cycles.cycleMeasures !== null) {
            let cycleID = this.props.cycles.cycleMeasures.cycleIdentifier
           cycleID = cycleID.substr(1,1)
            cycleID = parseInt(cycleID, 10)
            if (this.props.cycles.cycleMeasures.outcomes.length > 0) {
                list = this.props.cycles.cycleMeasures.outcomes.map(outcome => {
                    return (<li key={outcome.outcomeID}>
                        <Link to={"/admin/cycles/"+cycleID+"/"+outcome.outcomeID}>
                        {outcome.outcomeName}
                        </Link>
                        </li>)
                })
                
            }

            else {
                list = <p>No Outcomes Present.</p>
            }
            title = this.props.cycles.cycleMeasures.cycleName
        }

        let selections = null
        if (this.state.addOutcomes) {
            if (Object.keys(this.props.outcomes.outcomes) !== 0) {
                console.log(this.props)
                if (this.props.outcomes.outcomes.length > 0) {
                    selections = this.props.outcomes.outcomes.map(item => {
                        return (<option key={item.outcomeID} value={item.outcomeID}>
                            {item.outcomeDescription}
                        </option>)
                    })
                }
            }
        }
        else {
        }
        return (
            <Fragment>
                <section className="panel important">
                    <h2>{title}</h2>
                    <ol>{list}</ol>
                </section>

                <section className="panel important">
                    <button onClick={this.clickHandler.bind(this)} className="btn btn-primary btn-sm">Add Outcomes</button>
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
    cycles: PropTypes.object.isRequired,
}

const MapStateToProps = state => ({
    cycleMeasures: state.cycleMeasures,
    cycles: state.cycles,
    outcomes: state.outcomes
})


export default connect(MapStateToProps, { getOutcomes, linkOutcomeToCycle, getCycleMeasures })(CycleMeasures);