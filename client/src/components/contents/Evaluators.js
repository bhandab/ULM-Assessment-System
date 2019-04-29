import React, { Component } from "react";
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Form, Card, CardGroup, Button, Modal, InputGroup, ListGroup} from 'react-bootstrap';
import { getRegisteredEvaluators, getInvitedEvaluators, inviteEvaluator} from '../../actions/evaluatorAction';


class Evaluators extends Component {

    state = {
        invite: false
    }

    componentDidMount() {
        if (!this.props.auth.isAuthenticated || this.props.auth.user.role !== "coordinator") {
            this.props.history.push("/login")
        }
        this.props.getRegisteredEvaluators()
        this.props.getInvitedEvaluators()
    }

    inviteShow = () => {
        this.setState({ invite: true })
    }

    inviteHide = () => {
        this.setState({ invite: false })
    }

    inviteHandler = (e) => {
        e.preventDefault();
        this.props.inviteEvaluator({ evaluatorEmail: e.target.invEmail.value})
        this.setState({invite:false})
    }

    render() {

        let evaluatorsList = null

        if (this.props.evaluator.evaluators !== null) {
            evaluatorsList = this.props.evaluator.evaluators.evaluators.map((item, index) => {
                return (
                    <ListGroup id="ev-invited" key={index}>{item.name} ({item.email})</ListGroup>
                )
            })
        }

        let invitedList = null
        if (this.props.evaluator.invitedEvaluators !== null) {
            invitedList = this.props.evaluator.invitedEvaluators.invitedEvaluators.map((item, index) => {
                return (
                    <ListGroup key={index}>{item}</ListGroup>
                )
            })

        }

        return (
            <section className="panel important rounded p-3">
            <Card>
                <Card.Header style={{textAlign:'center'}}><h1>Evaluators</h1>
                </Card.Header>
                <Card.Body>
                    <CardGroup>
                <Card style={{ width: '30rem', float: "left"}}>
                <Card.Header style={{textAlign:'center'}}><h4>Registered Evaluators</h4></Card.Header>
                    <Card.Body>
                        <ListGroup.Item id="ev-list">
                            {evaluatorsList}
                        </ListGroup.Item>
                        <Button variant="primary" className="float-right mt-3" onClick={this.inviteShow}>Invite Evaluators</Button>
                    </Card.Body>
                </Card>

                <Card style={{ width: '30rem'}}>
                <Card.Header style={{textAlign:'center'}}><h4>Invited Evaluators</h4></Card.Header>
                    <Card.Body>
                        
                        <ListGroup.Item className="list-group">
                            {invitedList}
                        </ListGroup.Item>
                    </Card.Body>
                </Card>
                </CardGroup>
                </Card.Body>
            </Card>

                <Modal centered show={this.state.invite} onHide={this.inviteHide}>
                    <Modal.Title className="ml-3">
                        Invite Evaluators
                    </Modal.Title>
                    <Modal.Body>
                        <Form onSubmit={this.inviteHandler.bind(this)}>
                            <InputGroup>
                                <InputGroup.Append>
                                    <InputGroup.Text>
                                        Email
                                </InputGroup.Text>
                                </InputGroup.Append>
                                <Form.Control type="email" name="invEmail" placeholder="sth@example.com" />
                            </InputGroup>

                            {/* <InputGroup className="">

                                <p className="mb-0 mt-3">Upload a CSV File:</p><Form.Control id="inputFile" type="file" name="myFile" />
                            </InputGroup> */}
                            <Button variant="danger" className="mt-3 float-right ml-3" onClick={this.inviteHide}>Close</Button>
                            <Button variant="success" className="mt-3 float-right" type="submit">Invite</Button>
                        </Form>
                    </Modal.Body>
                </Modal>
            </section>

        )
    }
}

Evaluators.propTypes = {
    getRegisteredEvaluators: PropTypes.func.isRequired,
    getInvitedEvaluators: PropTypes.func.isRequired,
    inviteEvaluator: PropTypes.func.isRequired
}

const MapStateToProps = state => ({
    evaluators: state.regsEvals,
    cycles: state.cycles,
    evaluator: state.evaluator,
    auth: state.auth,
    errors: state.errors
})

export default connect(MapStateToProps, { getRegisteredEvaluators, getInvitedEvaluators, inviteEvaluator })(Evaluators)