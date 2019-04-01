import React, { Component, Fragment } from 'react';
import { getOutcomesMeasures, linkMeasureToOutcome } from "../../actions/assessmentCycleAction";
import { getMeasures } from "../../actions/measuresAction";
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Form, Button, InputGroup, Modal } from 'react-bootstrap';




class OutcomeMeasures extends Component {

    state = {
        addMeasures: false,
        createMeasures: true,
        modalShow: false,
        toolTypeVal : "rubric"
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
        let index = e.target.measures.value
        const measure = this.props.measures.measures[index]

        const measureDetails = {
            measureDescription: measure.measureName,
            projectedStudentNumber: measure.projectedStudentNumber + "",
            projectedValue: measure.projectedValue + "",
            course: measure.course
        }

        console.log(measureDetails)

        this.props.linkMeasureToOutcome(this.props.match.params.cycleID, this.props.match.params.outcomeID, measureDetails)

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

    modalShow = () => {
        this.setState({modalShow:true})
    }

    modalHide = () => {
        this.setState({ modalShow: false })
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
                        return (<option key={index} value={index}>
                            {item.measureName}
                        </option>)
                    })
                }
            }
        }

        let toolType = (e) =>{
            this.setState({toolTypeVal : e.target.value})
        }
        

        return (

            <Fragment>
                <section className="panel important">
                    <h2>{measureTitle}</h2>
                    <ol>{measures}</ol>
                </section>

                <section className="panel important">
                    <button onClick={this.clickHandler.bind(this)} className="btn btn-primary btn-sm mr-3">Add Measure</button>
                    <button onClick={this.modalShow} className="btn btn-primary btn-sm">Create Measure</button>
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
                        <Modal size="lg" centered show={this.state.modalShow} onHide={this.modalHide}>
                            <Modal.Header closeButton>
                                <Modal.Title id="contained-modal-title-vcenter">
                                Create New Measure
                                </Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                            <Form onSubmit={this.measureCreateHandler.bind(this)} >
                                <InputGroup className="mb-3 ml-0 row">
                                    <InputGroup.Prepend>
                                        <InputGroup.Text id="basic-addon1">At least</InputGroup.Text>
                                    </InputGroup.Prepend>
                                    <Form.Control type="number" className="col-md-4"
                                        placeholder="Projected Student Number"
                                        aria-label="Projected Student Number"
                                        aria-describedby="basic-addon1"
                                        name="projectedStudentNumber"
                                    />
                                    <select name="projType" className="custom-select col-sm-2" id="basic-addon1">
                                        <option value="%">%</option>
                                        <option value="p">percentile</option>
                                    </select>
                                    <InputGroup.Append>
                                        <InputGroup.Text id="basic-addon2"> of students completing </InputGroup.Text>
                                    </InputGroup.Append>
                                </InputGroup>

                                <InputGroup className="mb-3 ml-0 row">
                                    <Form.Control className="col-md-2"
                                        placeholder="Course Name"
                                        name="course"
                                    />
                                    <InputGroup.Append>
                                        <InputGroup.Text id="basic-addon3"> will score </InputGroup.Text>
                                    </InputGroup.Append>
                                    <Form.Control className="col-md-2"
                                        placeholder="Score"
                                        name="projectedValue"
                                    />
                                    <InputGroup.Append>
                                        <InputGroup.Text id="basic-addon4"> or greater in </InputGroup.Text>
                                    </InputGroup.Append>

                                        <select onChange={(e) => toolType(e)}name="toolType" className="custom-select col-sm-2" id = "toolType">
                                            <option value="rubric">rubric</option>
                                            <option value="test">test</option>
                                        </select>

                                        {(this.state.toolTypeVal === "rubric") ? 
                                            <select name="rubric" className="custom-select col-sm-2">
                                                <option value="rubric1">rubric1</option>
                                                <option value="rubric2">rubric2</option>
                                            </select>
                                        : 
                                            <select name="test" className="custom-select col-sm-2">
                                                <option value="test1">test1</option>
                                                <option value="test2">test2</option>
                                            </select>
                                        }

                                </InputGroup>



                                
                                <Button className="float-right" variant="primary" type="submit">
                                    Create
                                 </Button>
                            </Form>
                            </Modal.Body>
                        </Modal>
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
    //errors: PropTypes.object.isRequired
}

const MapStateToProps = state => ({
    outcomeMeasures: state.outcomeMeasures,
    cycles: state.cycles,
    measures: state.measures,
    errors: state.errors

})


export default connect(MapStateToProps, { getOutcomesMeasures, getMeasures, linkMeasureToOutcome })(OutcomeMeasures);