import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Spinner, Button, Modal, Form, Col,FormCheck } from 'react-bootstrap';
import { getAllRubrics, createRubric} from '../../actions/rubricsAction';
import PropTypes from 'prop-types';
import { isEmpty } from '../../utils/isEmpty';
import { Link } from 'react-router-dom';


class AllRubrics extends Component {

    state = {
        createRubric: false,
        scaleInfo: []
    }

    componentDidMount() {
        if (!this.props.auth.isAuthenticated && this.props.auth.user.role !== "coordinator") {
            this.props.history.push('/login')
        }

        this.props.getAllRubrics()
    }

    saveChangesHandler = e => {
        
        e.preventDefault();
        const rubricDetails = {
            rubricName: e.target.rubricTitle.value,
            rows: e.target.rows.value,
            columns: e.target.cols.value,
            weighted: e.target.weighted.checked+""
        };
        this.props.createRubric(rubricDetails,this.props.history);
        console.log(rubricDetails)
        this.setState({createRubric:false})
    };

    handleRubricCreateHide = () => {
        this.setState({ createRubric: false });
    };

    handleRubricCreateShow = () => {
        this.setState({ createRubric: true });
    };


    render() {

        let allRubrics = <Spinner animation="border" variant="primary" />;

        if (isEmpty(this.props.rubric.rubrics) === false) {
            if (this.props.rubric.rubrics.rubrics.length > 0) {
                allRubrics = this.props.rubric.rubrics.rubrics.map(rubric => {
                    return (<li className="list-group-item" key={rubric.rubricID}>
                        <Link to={"/admin/rubrics/" + rubric.rubricID}> {rubric.rubricTitle}
                        </Link>
                    </li>)
                })
            }
            else {
                allRubrics = <li className="list-group-item">No Rubrics Present!!</li>;

            }
        }
        else {
            allRubrics = <li className="list-group-item">No Rubrics Present!!</li>;

        }

        return (
            <section className="panel important">
                <h2>All Rubrics</h2>
                <hr />
                <ol className="list-group">{allRubrics}</ol>
                <br></br>
                <Button
                    variant="primary"
                    onClick={this.handleRubricCreateShow}
                    className="float-left"
                    
                >
                    Create New Rubric
          </Button>

                <Modal
                    show={this.state.createRubric}
                    onHide={this.handleRubricCreateHide}
                >
                    <Modal.Header closeButton>
                        <Modal.Title className="font-weight-bold">
                            Rubric Details
              </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form onSubmit={this.saveChangesHandler.bind(this)}>
                            <Form.Group>
                                <Form.Label className="font-weight-bold">
                                    Rubric Title
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter Rubric Title"
                                    name="rubricTitle"
                                />
                            </Form.Group>
                            <Form.Row className="mb-4">
                                <Col>
                                    <Form.Label className="font-weight-bold">Rows</Form.Label>
                                    <Form.Control
                                        type="number"
                                        placeholder="No. of Rows"
                                        min="0"
                                        max="15"
                                        name="rows"
                                    />
                                </Col>
                                <Col>
                                    <Form.Label className="font-weight-bold">
                                        Columns
                                    </Form.Label>
                                    <Form.Control
                                        type="number"
                                        placeholder="No. of Cols"
                                        min="0"
                                        max="15"
                                        name="cols"
                                    />
                                </Col>
                            </Form.Row>
                        <FormCheck type="checkbox" label="Weighted Rubric" name="weighted"/>
                           

                            <Button
                                variant="secondary"
                                className="float-right ml-2"
                                onClick={this.handleRubricCreateHide}
                            >
                                Close
                            </Button>
                            <Button
                                variant="primary"
                                type="submit"
                                className="float-right"
                                
                            >
                                Save Changes
                            </Button>
                        </Form>
                    </Modal.Body>
                </Modal>

            </section>
        )
    }
}

AllRubrics.propTypes = {
    getAllRubrics: PropTypes.func.isRequired,
    auth: PropTypes.object.isRequired,
    createRubric: PropTypes.func.isRequired,
    errors: PropTypes.object.isRequired
}

const MapStateToProps = state => ({
    globalRubrics: state.globalRubrics,
    auth: state.auth,
    rubric: state.rubric,
    errors: state.errors
})
export default connect(MapStateToProps, { getAllRubrics, createRubric })(AllRubrics)