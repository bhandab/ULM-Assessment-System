import React, { Component, Fragment } from 'react';
import { getCycleMeasures, linkOutcomeToCycle } from '../../actions/assessmentCycleAction';
import { getOutcomes } from '../../actions/outcomesAction';
import { Link } from 'react-router-dom'
import { connect } from 'react-redux';
import PropTypes from 'prop-types';


class CycleMeasures extends Component {

    state = {
        addOutcomes: false,
        createOutcome: false
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

    outcomeAddHandler = (e) => {
        e.preventDefault();
        console.log(e.target.outcomes.value)
        this.setState({ addOutcomes: !this.state.addOutcomes })
        this.props.linkOutcomeToCycle(this.props.match.params.id,
            { outcomeDescription: e.target.outcomes.value })


    }

    createNewButtonHandler = (e) => {
        e.preventDefault();
        this.setState({ createOutcome: !this.state.createOutcome })
    }

    outcomeCreateHandler = (e) => {
        e.preventDefault();
        console.log(e.target.newOutcome.value);
        this.setState({ createOutcome: !this.state.createOutcome })
        this.props.linkOutcomeToCycle(this.props.match.params.id,
            { outcomeDescription: e.target.newOutcome.value },
            this.props.history)

    }

    render() {

        let title = null
        let list = <p>Loading!!</p>
        let outcomeArray = null;

        //console.log(this.props)
        if (this.props.cycles.cycleMeasures !== null) {
            let cycleID = this.props.cycles.cycleMeasures.cycleIdentifier
            //let cycleID = this.match.params.id
            //cycleID = parseInt(cycleID, 10)
            if (this.props.cycles.cycleMeasures.outcomes !== undefined) {
                if (this.props.cycles.cycleMeasures.outcomes.length > 0) {
                    outcomeArray = this.props.cycles.cycleMeasures.outcomes
                    list = this.props.cycles.cycleMeasures.outcomes.map(outcome => {
                        return (<li key={outcome.outcomeID}>
                            <Link to={"/admin/cycles/cycle/" + cycleID + "/outcomes/" + outcome.outcomeID}>
                                {outcome.outcomeName}
                            </Link>
                        </li>)
                    })

                }


                else {
                    list = <p>No Outcomes Present.</p>
                }
            }
            title = this.props.cycles.cycleMeasures.cycleName
        }
        let selections = null
        if (this.state.addOutcomes) {
            if (Object.keys(this.props.outcomes.outcomes) !== 0) {
                // console.log(this.props)
                if (this.props.outcomes.outcomes.length > 0) {
                    selections = this.props.outcomes.outcomes.map((item, index) => {
                        const temp = outcomeArray.find(outcome => {
                            return outcome.outcomeName === item
                        })
                        if (temp === undefined) {
                            return (<option key={index} value={item}>
                                {item}
                            </option>)
                        }
                        else{
                            return null
                        }
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
                    {(!this.state.createOutcome) ? <button onClick={this.clickHandler.bind(this)} className="btn btn-primary btn-sm">Select from Existing</button> : null}
                    {(!this.state.addOutcomes) ? <button className="btn btn-primary btn-sm" onClick={this.createNewButtonHandler.bind(this)}>Create New</button> : null}
                    {(this.state.addOutcomes) ?
                        <div id="select-from-exixting">
                            <br></br>
                            <h4>Please Select Outcome:</h4>
                            <form onSubmit={this.outcomeAddHandler.bind(this)}>
                                <select name="outcomes">{selections}</select>
                                <br></br>
                                <br></br>
                                <button type="submit" className="btn btn-outline-primary btn-sm" value="submit">Submit</button>
                            </form>
                        </div>
                        : null}
                    {(this.state.createOutcome) ?
                        <div id="create-new">
                            <br></br>
                            <h4> Create a new outcome:</h4>
                            <form onSubmit={this.outcomeCreateHandler.bind(this)}>
                                <input type="textarea" name="newOutcome"></input>
                                <button type="submit" className="btn btn-outline-primary btn-sm">Create</button>
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
    outcomes: state.outcomes,
    errors: state.errors
})


export default connect(MapStateToProps, { getOutcomes, linkOutcomeToCycle, getCycleMeasures })(CycleMeasures);