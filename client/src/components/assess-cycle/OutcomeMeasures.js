import React, { Component, Fragment } from 'react';
import { getOutcomesMeasures, linkMeasureToOutcome } from "../../actions/assessmentCycleAction";
import { getMeasures } from "../../actions/measuresAction";
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Form, Button } from 'react-bootstrap';




class OutcomeMeasures extends Component {

    state = {
        addMeasures: false,
        createMeasures: false
    }

    componentDidMount() {
        const cycleID = this.props.match.params.cycleID
        const outcomeID = this.props.match.params.outcomeID
        this.props.getOutcomesMeasures(cycleID, outcomeID)
    }

    clickHandler = (e) => {
        e.preventDefault()

        if (!this.state.addMeasures) {
            this.props.getMeasures()
        }
        this.setState({ addMeasures: !this.state.addMeasures })

    }

    measureCreateButtonHandler = (e) => {
        e.preventDefault()
        this.setState({ createMeasures: !this.state.createMeasures })
    }

    measureAddHandler = (e) => {
        e.preventDefault();
        console.log(e.target.measures.value)
        this.props.linkMeasureToOutcome(this.props.cycles.outcomeMeasures.cycleID, this.props.cycles.outcomeMeasures.outcomeID, e.target.measures.value)
        window.location.reload()

    }

    measureCreateHandler = (e) => {
        e.preventDefault();
        const cycleID = this.props.cycles.outcomeMeasures.cycleID
        const outcomeID = this.props.cycles.outcomeMeasures.outcomeID

        const measureDetails = {
            measureDescription: e.target.measureDesc.value,
            projectedStudentNumber: e.target.projectedResult.value,
            projectedValue: e.target.projectedScore.value,
            course: e.target.courseAssctd.value
        }

        this.props.linkMeasureToOutcome(cycleID, outcomeID, measureDetails)
        this.setState({ createMeasures: false })

    }

    render() {
        console.log(this.props)
        let measures = <p>Loading!!!</p>
        let measureTitle = null
        if (this.props.cycles.outcomeMeasures !== null) {
            if (Object.keys(this.props.cycles.outcomeMeasures).length > 1) {
                if (this.props.cycles.outcomeMeasures.measures.length > 0) {
                    measures = this.props.cycles.outcomeMeasures.measures.map(measure => {
                        return (<li key={measure.measureID}>
                            <Link to={"/admin/cycles/cycle/" +
                                this.props.cycles.outcomeMeasures.cycleID + "/outcomes/" +
                                this.props.cycles.outcomeMeasures.outcomeID + "/measures/" +
                                measure.measureID}>
                                {measure.measureName}
                            </Link>

                        </li>)
                    })
                    measureTitle = this.props.cycles.outcomeMeasures.outcomeName
                }

                else {
                    measures = <p>No measures present for this outcome</p>
                }
                measureTitle = this.props.cycles.outcomeMeasures.outcomeName
            }
        }

        let selections = null
        if (this.state.addMeasures) {
            if (Object.keys(this.props.measures).length > 0) {
                console.log(this.props)
                if (this.props.measures.measures !== null) {
                    selections = this.props.measures.measures.map((item, index) => {
                        return (<option key={index} value={item.measureName}>
                            {item.measureName}
                        </option>)
                    })
                }
            }
        }

        return (

            <Fragment>
                <section className="panel important">
                    <h2>{measureTitle}</h2>
                    <ol>{measures}</ol>
                </section>

                <section className="panel important">
                    <button onClick={this.clickHandler.bind(this)} className="btn btn-primary btn-sm">Add Measure</button>
                    <button onClick={this.measureCreateButtonHandler.bind(this)} className="btn btn-primary btn-sm">Create Measure</button>
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

                    {(this.state.createMeasures) ?
                        <div>
                            <br></br>
                            <Form onSubmit={this.measureCreateHandler.bind(this)} >
                                <Form.Group>
                                    <Form.Label>Measure Description</Form.Label>
                                    <Form.Control type="text" placeholder="Enter the measure description" name="measureDesc" />
                                    <Form.Text className="text-muted">
                                        Example: At least 75% of students will receive an average rubric score of 3 of greater when
                                        evaluated using the oral communication rubric.
                                    </Form.Text>
                                </Form.Group>
                                <Form.Group>
                                    <Form.Label>Projected Result</Form.Label>
                                    <Form.Control type="number" placeholder="Projected Result" step="0.01" max="100" min="0" name="projectedResult" />
                                    <Form.Text className="text-muted">
                                        The projected amount of students. Example: 75%
                                    </Form.Text>

                                </Form.Group>
                                <Form.Group>
                                    <Form.Label>Projected Score</Form.Label>
                                    <Form.Control type="number" placeholder="Projected Score" step="0.01" min="0" name="projectedScore" />
                                    <Form.Text className="text-muted">
                                        The desired score. Example: 3
                                    </Form.Text>
                                </Form.Group>
                                <Form.Group>
                                    <Form.Label>Associated Course</Form.Label>
                                    <Form.Control type="text" placeholder="Associated Course" step="0.01" min="0" name="courseAssctd" />
                                    <Form.Text className="text-muted">
                                        The associated course. Example: CSCI 4065
                                    </Form.Text>
                                </Form.Group>

                                <Button variant="primary" type="submit">
                                    Create
                                 </Button>


                            </Form>
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
    linkMeasureToOutcome: PropTypes.func.isRequired,
    errors: PropTypes.object.isRequired
}

const MapStateToProps = state => ({
    outcomeMeasures: state.outcomeMeasures,
    cycles: state.cycles,
    measures: state.measures,
    errors: state.errors

})


export default connect(MapStateToProps, { getOutcomesMeasures, getMeasures, linkMeasureToOutcome })(OutcomeMeasures);