import React, { Component, Fragment } from 'react';
import { Button, Form, Modal, Col, Jumbotron } from 'react-bootstrap';
import { createRubric, getAllRubrics } from '../../actions/rubricsAction';
import { connect } from 'react-redux';
import PropTypes from "prop-types";



class MeasureDetails extends Component {

    state = {
        show: false,
    }

    /*componentDidMount(){
        const cycleID = this.props.match.params.cycleID
        const outcomeID = this.props.match.params.outcomeID
        const measureID = this.props.match.params.measureID
        this.props.getAllRubrics(cycleID,outcomeID,measureID)
    }*/

    handleClose = () => {
        this.setState({ show: false });
    }

    handleShow = () => {
        this.setState({ show: true });
    }


    saveChangesHandler = (e) => {
        e.preventDefault()
        console.log(e.target.rubricTitle.value)
        const cycleID = this.props.match.params.cycleID
        const outcomeID = this.props.match.params.outcomeID
        const measureID = this.props.match.params.measureID

        const rubricDetails = {
            rubricName: e.target.rubricTitle.value,
            rows: e.target.rows.value,
            columns: e.target.cols.value
        }
        this.props.createRubric(cycleID, outcomeID, measureID, rubricDetails)
        this.setState({tableCreated:true})
    }

    render() {
        console.log(this.props)

       /* let rubricTable = []
        const rows = this.props.rubric.rubric.rubricDetails.structureInfo.noOfRows
        const cols = this.props.rubric.rubric.rubricDetails.structureInfo.noOfRows*/

        return (
            <Fragment>
                <section className="panel important">
                    <Button variant="primary" onClick={this.handleShow} className="float-right">
                        Create New Rubric
                    </Button>


                    <Modal show={this.state.show} onHide={this.handleClose}>
                        <Modal.Header closeButton>
                            <Modal.Title className="font-weight-bold">Rubric Details</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Form onSubmit={this.saveChangesHandler.bind(this)}>
                                <Form.Group>
                                    <Form.Label className="font-weight-bold">Rubric Title</Form.Label>
                                    <Form.Control type="text" placeholder="Enter Rubric Title" name="rubricTitle" />
                                </Form.Group>
                                <Form.Row className="mb-4">
                                    <Col>
                                        <Form.Label className="font-weight-bold">Rows</Form.Label>
                                        <Form.Control type="number" placeholder="No. of Rows" min="0" max="15" name="rows" />
                                    </Col>
                                    <Col>
                                        <Form.Label className="font-weight-bold">Columns</Form.Label>
                                        <Form.Control type="number" placeholder="No. of Cols" min="0" max="15" name="cols" />
                                    </Col>
                                </Form.Row>
                                <Button variant="secondary" className="float-right ml-2" onClick={this.handleClose}>
                                    Close
                            </Button>
                                <Button variant="primary" type="submit" className="float-right" onClick={this.handleClose}>
                                    Save Changes
                            </Button>
                            </Form>
                        </Modal.Body>
                    </Modal>
                </section>
            </Fragment>
        )
    }

}

MeasureDetails.propTypes = {
    createRubric: PropTypes.func.isRequired,
    getAllRubrics: PropTypes.func.isRequired
}

const MapStateToProps = state => ({
    rubric: state.rubric,
    errors: state.errors,
    cycles: state.cycles,
    cycleMeasures: state.cycleMeasures,
    outcomeMeasures: state.outcomeMeasures,
    rubrics: state.rubrics
})
export default connect(MapStateToProps, { createRubric, getAllRubrics})(MeasureDetails);