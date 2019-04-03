import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Spinner, Button, Modal, Form, Col } from 'react-bootstrap';
import { getRubricsGlobal, createRubric} from '../../actions/rubricsAction';
import PropTypes from 'prop-types';
import { isEmpty } from '../../utils/isEmpty';
import { Link } from 'react-router-dom';


class AllRubrics extends Component {

    state = {
        createRubric: false,
        scaleInfo: []
    }

    componentDidMount() {
        if (!this.props.auth.isAuthenticated) {
            this.props.history.push('/login')
        }

        this.props.getRubricsGlobal()
    }

    saveChangesHandler = e => {
        e.preventDefault();
        console.log(e.target.rubricTitle.value);

        let scaleInfo = []

        for(let i = 0; i < this.state.scaleInfo.length; i++){
            console.log(e.target)
            const scaleDescName = `scaleDesc${i+1}`
            const scaleValName = `scaleValue${(i+1)}`
            const scaleDesc = document.getElementById(scaleDescName).value
            console.log(scaleDesc)
            const value = document.getElementById(scaleValName).value
            console.log(value)
            const scale = {
                scaleDesc: scaleDesc,
                scaleValue : value
            }
            scaleInfo.push(scale)
            console.log(scale)
        }
        
        const rubricDetails = {
            rubricName: e.target.rubricTitle.value,
            rows: e.target.rows.value,
            columns: e.target.cols.value,
            scales: scaleInfo
        };
        //this.props.createRubric(cycleID, outcomeID, rubricDetails);
        console.log(rubricDetails)
        this.setState({createRubric:false})
    };

    handleRubricCreateHide = () => {
        this.setState({ createRubric: false });
    };

    handleRubricCreateShow = () => {
        this.setState({ createRubric: true });
    };

    columnChangeHandler = (e) => {
        console.log("Column Changed")
        console.log(e.target.parent)
        const cols = e.target.value
        for(let i = 0; i < cols; i++){

        }
    }

    render() {
        //console.log("all rubrics")
       // console.log(this.props)
        let allRubrics = <Spinner animation="border" variant="primary" />;

        if (isEmpty(this.props.rubric.globalRubrics) === false) {
            if (this.props.rubric.globalRubrics.length > 0) {
                allRubrics = this.props.rubric.globalRubrics.map(rubric => {
                    return (<li key={rubric.rubricID}>
                        <Link to={"/admin/rubrics/" + rubric.rubricID}> {rubric.rubricTitle}
                        </Link>
                    </li>)
                })
            }
            else {
                allRubrics = <p>No Rubrics Present!!</p>;

            }
        }
        else {
            allRubrics = <p>No Rubrics Present!!</p>;

        }

        
       const columnChangeHandler = (e) => {
            this.setState({scaleInfo:[]})
            let scaleInfo = []
            console.log("Column Changed")
            console.log(e.target.parentNode.parentNode)
            const cols = e.target.value
            console.log(cols)
            for (let i = 0; i < cols; i++) {
                
               const scale = ( <Form.Row className="mb-4" key ={i}>
                    <Col>
                        <Form.Label className="font-weight-bold">Scale Description</Form.Label>
                        <Form.Control
                            placeholder="Description"
                            id={"scaleDesc"+(i+1)}
                        />
                    </Col>
                    <Col>
                        <Form.Label className="font-weight-bold">
                            Value
                    </Form.Label>
                        <Form.Control
                            type="number"
                            placeholder="Numeric Value"
                            min="1"
                            max={cols}
                            id={"scaleValue"+(i+1)}
                        />
                    </Col>
               </Form.Row> )
                scaleInfo.push(scale)
                this.setState({scaleInfo:scaleInfo})
            }
        }

        return (
            <section className="panel important">
                <h2>All Rubrics</h2>
                <hr />
                <ol>{allRubrics}</ol>
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
                                    <Form.Control onChange={columnChangeHandler.bind(this)}
                                        type="number"
                                        placeholder="No. of Cols"
                                        min="0"
                                        max="15"
                                        name="cols"
                                    />
                                </Col>
                            </Form.Row>
                            {this.state.scaleInfo}
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
    getRubricsGlobal: PropTypes.func.isRequired,
    auth: PropTypes.object.isRequired
}

const MapStateToProps = state => ({
    globalRubrics: state.globalRubrics,
    auth: state.auth,
    rubric: state.rubric
})
export default connect(MapStateToProps, { getRubricsGlobal })(AllRubrics)