import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import PropTypes from "prop-types";
import {inviteEvaluator} from '../../actions/evaluatorAction'
import { getMeasureDetails, getMeasureEvaluators, addEvaluator } from '../../actions/assessmentCycleAction';
import { Jumbotron, Card, Button, Modal, Form} from 'react-bootstrap'
import { isEmpty } from "../../utils/isEmpty";



class MeasureDetails extends Component {
    state = {
        addEval: false,
        addStud: false,
        inviteEval: false,
        email: "",
        errors:{}
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

    componentWillReceiveProps(nextProps){
        if (this.props.errors !== nextProps.errors) {
            this.setState({errors:nextProps.errors})
        }
    }

    addEvalShow = () => {
        this.setState({addEval:true})
    } 

    addEvalHide = () => {
        this.setState({addEval:false, errors:{}})
    }

    addEvaluatorHandler = (e) => {
        e.preventDefault()
        this.props.addEvaluator(this.props.match.params.measureID, 
            {evaluatorEmail:e.target.evalEmail.value})
        this.setState({ email: e.target.evalEmail.value})
    }

    inviteEvaluatorHandler = (e) => {
        e.preventDefault()
        this.props.inviteEvaluator({ evaluatorEmail:e.target.evalEmail.value})
        this.setState({errors:{}, addEval:false})
    
    }



    render() {
        console.log(this.props)
        let measureTitle = null
        let evaluatorList = []
        if (this.props.cycles.measureDetails !== null && this.props.cycles.measureDetails !== undefined ) {
            measureTitle = this.props.cycles.measureDetails.measureDescription
            if (this.props.cycles.measureEvaluators !== null && this.props.cycles.measureEvaluators !== undefined){
            evaluatorList = this.props.cycles.measureEvaluators.evaluators.map(evaluator => {
                return (
                    <li key={evaluator.measureEvalID} className="list-group-item">{evaluator.name}</li>
                )
            })
        }
        }

        const inviteError = "Evaluator Account Does not Exist. Please check the invitee lists or invite the evaluator to create an account"

        return (
            <Fragment>
                <section className="panel important">
                    <Jumbotron>
                        <p id="measure-title-label">Measure Title</p>
                        <h4 id="measure-title">{measureTitle}</h4>
                        <hr />

                        <Card style={{ height:'15rem',width: '30rem', float:"left"}}>
                            <Card.Body>
                                <Card.Title>Evaluators</Card.Title>
                               <ol className="list-group">
                                    {evaluatorList}
                               </ol>
                                <Button variant="primary" className="float-right mt-3"onClick={this.addEvalShow}>Add Evaluators</Button>
                            </Card.Body>
                        </Card>

                        <Card style={{ width: '30rem', height:'15rem'}}>
                            <Card.Body>
                                <Card.Title>Students</Card.Title>
                                <Card.Text>
                                    Student List
                                </Card.Text>
                                <Button variant="primary" className="float-right mt-3">Add Students</Button>
                            </Card.Body>
                        </Card>
                    </Jumbotron>
                </section>
            <Modal show={this.state.addEval} onHide={this.addEvalHide} centered>
                <Modal.Title className="ml-3 mt-2">
                    Add Evaluator
                </Modal.Title>
                <Modal.Body>
                    <Form onSubmit={this.addEvaluatorHandler.bind(this)}>
                            <Form.Group controlId="formBasicEmail">
                                <Form.Label >Email address</Form.Label>
                                <Form.Control type="email" name="evalEmail" placeholder="Enter email"/>
                                <Form.Text className="text-muted text-danger">
                                    {this.state.errors.evaluatorEmail}
                                </Form.Text>
                            </Form.Group>
                        <Button variant="success"  type="submit" className="mt-3 float-right">Add</Button>
                    </Form>
                </Modal.Body>
                    <Modal show={this.state.errors.evaluatorEmail === inviteError} onHide={this.addEvalHide} centered>
                        <Modal.Title className="ml-3 mt-2">
                            Invite Evaluator
                </Modal.Title>
                        <Modal.Body>
                            <Form onSubmit={this.inviteEvaluatorHandler.bind(this)}>
                                <Form.Group controlId="formBasicEmail">
                                    <Form.Label >Email address</Form.Label>
                                    <Form.Control type="email" name="evalEmail" placeholder="Enter email" defaultValue={this.state.email} />
                                    <Form.Text className="text-muted text-danger">
                                        {this.state.errors.evaluatorEmail}
                                    </Form.Text>
                                </Form.Group>
                                <Button variant="success" type="submit" className="mt-3 float-right">Invite</Button>
                            </Form>
                        </Modal.Body>
                    </Modal>
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
    inviteEvaluator: PropTypes.func.isRequired
}

const MapStateToProps = state => ({
    auth: state.auth,
    cycles: state.cycles,
    measureDetails: state.measureDetails,
    measureEvaluators: state.measureEvaluators,
    errors: state.errors
})
export default connect(MapStateToProps,{getMeasureDetails,getMeasureEvaluators,addEvaluator, inviteEvaluator})(MeasureDetails);