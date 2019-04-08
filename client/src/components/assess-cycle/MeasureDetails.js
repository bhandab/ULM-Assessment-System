import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import PropTypes from "prop-types";
import { inviteEvaluator } from '../../actions/evaluatorAction'
import { getMeasureDetails, getMeasureEvaluators, addEvaluator, addStudentsToMeasure } from '../../actions/assessmentCycleAction';
import { Jumbotron, Card, Button, Modal, Form, InputGroup } from 'react-bootstrap'
import { isEmpty } from "../../utils/isEmpty";



class MeasureDetails extends Component {
    state = {
        addEval: false,
        addStud: false,
        inviteEval: false,
        email: "",
        errors: {},
        file:""
    }


    componentDidMount() {
        if (!this.props.auth.isAuthenticated && this.props.auth.user.role !== "coordinator") {
            this.props.history.push('/login')
        }
        const cycleID = this.props.match.params.cycleID
        const outcomeID = this.props.match.params.outcomeID
        const measureID = this.props.match.params.measureID

        this.props.getMeasureDetails(cycleID, outcomeID, measureID)
        this.props.getMeasureEvaluators(measureID)
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.errors !== nextProps.errors) {
            this.setState({ errors: nextProps.errors })
        }
    }

    addEvalShow = () => {
        this.setState({ addEval: true })
    }

    addEvalHide = () => {
        this.setState({ addEval: false, errors: {} })
    }

    addStudShow = () => {
        this.setState({ addStud: true })
    }

    addStudHide = () => {
        this.setState({ addStud: false })
    }

    addStudHide = () => {
        this.setState({ addStud: false })
    }

    addEvaluatorHandler = (e) => {
        e.preventDefault()
        this.props.addEvaluator(this.props.match.params.measureID,
            { evaluatorEmail: e.target.evalEmail.value })
        this.setState({ email: e.target.evalEmail.value, addEval:false})
    }

    inviteEvaluatorHandler = (e) => {
        e.preventDefault()
        this.props.inviteEvaluator({ evaluatorEmail: this.state.email })
        this.setState({ errors: {}, inviteEval: false })

    }

    fileChangeHandler = (e) => {
        this.setState({file:e.target.files[0]})
    }

    addStudentsHandler = (e) => {
        e.preventDefault()
        console.log(e.target)
        this.fileUpload(this.state.file)
    }

    fileUpload = (file) => {
        const formData = new FormData()
        formData.append('file',file)

        const config = {
            headers:{
                'content-type': 'multipart/fomr-data'
            }
        }
        console.log(formData)
        this.props.addStudentsToMeasure(this.props.match.params.measureID,formData,config)
        //Upload file action here
    }



    render() {
        console.log(this.props)
        let typeRubric = false
        let measureTitle = null
        let evaluatorList = []

        if (this.props.cycles.measureDetails !== null && this.props.cycles.measureDetails !== undefined) {
            measureTitle = this.props.cycles.measureDetails.measureDescription
            if (this.props.cycles.measureEvaluators !== null && this.props.cycles.measureEvaluators !== undefined) {
                evaluatorList = this.props.cycles.measureEvaluators.evaluators.map(evaluator => {
                    return (
                        <li key={evaluator.measureEvalID} className="list-group-item">{evaluator.name} ({evaluator.email})</li>
                    )
                })
            }
            if (this.props.cycles.measureDetails.toolType === "rubric") {
                typeRubric = true
            }

        }

        const inviteError = "Evaluator Account Does not Exist. Please check the invitee lists or invite the evaluator to create an account"
        const invitedError = "Invitation has been sent, but Evaluator has not created the account yet; Please contact the evaluator"

        if (this.state.errors === this.props.errors && this.props.errors.evaluatorEmail === invitedError) {
            window.alert("Invitation has been sent, but Evaluator has not created the account yet; Please contact the evaluator")
            this.setState({errors:{}})
        }
        return (
            <Fragment>
                <section className="panel important">
                    <Jumbotron>
                        <p id="measure-title-label">Measure Title</p>
                        <h4 id="measure-title">{measureTitle}</h4>
                        <hr />

                        {typeRubric ?
                            <Fragment>
                                <Card style={{width: '30rem', float: "left" }}>
                                    <Card.Body>
                                        <Card.Title>Evaluators</Card.Title>
                                        <ol className="list-group">
                                            {evaluatorList}
                                        </ol>
                                        <Button variant="primary" className="float-right mt-3" onClick={this.addEvalShow}>Add Evaluators</Button>
                                    </Card.Body>
                                </Card>

                                <Card style={{ width: '30rem', height: '15rem' }}>
                                    <Card.Body>
                                        <Card.Title>Students</Card.Title>
                                        <Card.Text>
                                            Student List
                                </Card.Text>
                                        <Button variant="primary" className="float-right mt-3" onClick={this.addStudShow}>Add Students</Button>
                                    </Card.Body>
                                </Card>
                            </Fragment> : null}
                    </Jumbotron>
                </section>

                <Modal centered show={this.state.addStud} onHide={this.addStudHide}>
                    <Modal.Title className="ml-3">
                        Add Students to Measure
                    </Modal.Title>
                    <Modal.Body>
                        <Form onSubmit={this.addStudentsHandler.bind(this)}>
                            <InputGroup>
                                <InputGroup.Append>
                                    <InputGroup.Text>
                                        Details
                                </InputGroup.Text>
                                </InputGroup.Append>
                                <Form.Control type="email" placeholder="name,CWID,email" />
                            </InputGroup>

                            <InputGroup className="">

                                <p className="mb-0 mt-3">Upload a CSV File:</p><Form.Control 
                                id="studentFile" 
                                type="file" 
                                name="studentFile"
                                onChange={this.fileChangeHandler.bind(this)}/>
                            </InputGroup>
                            <Button variant="danger" className="mt-3 float-right ml-3" onClick={this.addStudHide}>Close</Button>
                            <Button variant="success" className="mt-3 float-right" type="submit">Add</Button>
                        </Form>
                    </Modal.Body>
                </Modal>


                <Modal show={this.state.addEval && this.props.errors.evaluatorEmail !== inviteError} onHide={this.addEvalHide} centered>
                    <Modal.Title className="ml-3 mt-2">
                        Add Evaluator
                    </Modal.Title>
                    <Modal.Body>
                        <Form onSubmit={this.addEvaluatorHandler.bind(this)}>
                            <Form.Group controlId="formBasicEmail">
                                <Form.Label >Email address</Form.Label>
                                <Form.Control type="email" name="evalEmail" placeholder="Enter email" />
                            </Form.Group>
                            <Button variant="danger" className="mt-3 float-right ml-3" onClick={this.addEvalHide}>Close</Button>
                            <Button variant="success" type="submit" className="mt-3 float-right">Add</Button>
                        </Form>
                    </Modal.Body>
                </Modal>

                <Modal show={this.props.errors.evaluatorEmail === inviteError} centered>
                    <Modal.Title className="ml-3 mt-2">
                        Invite Evaluator
                        </Modal.Title>
                    <Modal.Body>
                        <Form onSubmit={this.inviteEvaluatorHandler.bind(this)}>
                            <Form.Group controlId="formBasicEmail">
                                <Form.Label >Evaluator account doesn't exist!!</Form.Label>
                                <Form.Label>Do you want to invite <strong>{this.state.email}</strong> for registration?</Form.Label>
                                {/*<Form.Text className="text-muted text-danger">
                                        {this.state.errors.evaluatorEmail}
                                    </Form.Text>*/}
                            </Form.Group>
                            <Button variant="danger" className="mt-3 float-right">No</Button>
                            <Button variant="success" type="submit" className="mt-3 float-right mr-2">Invite</Button>

                        </Form>
                    </Modal.Body>
                </Modal>

            </Fragment>
        )
    }

}

MeasureDetails.propTypes = {
    auth: PropTypes.object.isRequired,
    getMeasureDetails: PropTypes.func.isRequired,
    getMeasureEvaluators: PropTypes.func.isRequired,
    addEvaluator: PropTypes.func.isRequired,
    inviteEvaluator: PropTypes.func.isRequired,
    addStudentsToMeasure: PropTypes.func.isRequired
}

const MapStateToProps = state => ({
    auth: state.auth,
    cycles: state.cycles,
    measureDetails: state.measureDetails,
    measureEvaluators: state.measureEvaluators,
    errors: state.errors
})
export default connect(MapStateToProps, 
    { getMeasureDetails, 
    getMeasureEvaluators, 
    addEvaluator, 
    inviteEvaluator,
    addStudentsToMeasure })(MeasureDetails);