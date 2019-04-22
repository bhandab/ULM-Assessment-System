import React, { Component, Fragment } from "react";
import SuperAdminLayout from "../layouts/SuperAdminLayout";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Card, Form, Button, Modal, ListGroup, InputGroup } from "react-bootstrap";
import {inviteCoordinator,
  getInvitedCoordinators,
  getRegisteredCoordinators,
  getPrograms,
  createProgram} from '../../actions/coordinatorAction';
import {isEmpty} from '../../utils/isEmpty'

class SuperAdmin extends Component {

    state = {
        coorInvite : false,
        createProgram : false
    }

    componentDidMount(){
      if (!this.props.auth.isAuthenticated || this.props.auth.user.role !== "superuser"){
          this.props.history.push('/login')
        }
        this.props.getInvitedCoordinators();
        this.props.getRegisteredCoordinators();
        this.props.getPrograms();

    }

    coorInviteShow = () => {
        this.setState({coorInvite:true})
    }

    
    coorInviteHide = () => {
        this.setState({coorInvite:false})
    }

    createProgramShow = () => {
      this.setState({createProgram:true})
    }

    createProgramHide = () => {
      this.setState({createProgram:false})
    }

    inviteCoordinator = e => {
        e.preventDefault();
        const email = e.target.email.value
        const program = e.target.program.value
        const body = {
            coordinatorEmail: email,
            programName: program 
        }
        // console.log(body)
        this.props.inviteCoordinator(body)
        if(isEmpty(this.props.errors) === false){
            window.alert("Coordinator successfully invited")

        }
        else{
            window.alert(this.props.errors.errors)
        }
    }

    createProgram = e => {
      e.preventDefault();
      console.log(e.target.programName.value)
      const body = {
        programName:e.target.programName.value
      }
      this.props.createProgram(body)
      this.setState({createProgram:false})
    }
  render() {

      let invitedCoordinators = []
      let registeredCoordinators = []
      let programs = []

      if (this.props.coordinators.programs !== null && 
        this.props.coordinators.programs !== undefined){
          programs = this.props.coordinators.programs.map(program => {
            return(
              <ListGroup.Item key={program.programID}>{program.programName}</ListGroup.Item>
            )
          })
        }

      if(this.props.coordinators.invitedCoordinators !== null &&
        this.props.coordinators.invitedCoordinators !== undefined){
        invitedCoordinators = this.props.coordinators.invitedCoordinators.invitedCoordinators.map((item,index) => {
            return (
                <ListGroup.Item key={"inv"+index}>
                    <ul>
                        <li>Email: {item.email}</li>
                        <li>Program: {item.program}</li>
                    </ul>
                    </ListGroup.Item>
            )
        })
      }

      if(this.props.coordinators.registeredCoordinators !== null &&
        this.props.coordinators.registeredCoordinators !== undefined){
        registeredCoordinators = this.props.coordinators.registeredCoordinators.registeredCoordinators.map((item,index) => {
            return (
                <ListGroup.Item key={"reg"+index}>
                    <ul>
                        <li>Name: {item.name}</li>
                        <li>Email: {item.email}</li>
                        <li>Department: {item.program}</li>
                    </ul>
                    </ListGroup.Item>
            )
        })
      }
      
      console.log(this.props)

    return (
      <Fragment>
        <SuperAdminLayout/>
        <main>
          <section className="panel important">
          <Card>
            <Card.Header><h2 style={{textAlign:'center'}}>Programs <button className="float-right"
            onClick={this.createProgramShow}><i className="far fa-calendar-plus"></i></button></h2></Card.Header>
            <Card.Body>
              <ListGroup>
              {programs}
              {this.state.createProgram ? 
              <ListGroup.Item>
                <Form onSubmit={this.createProgram.bind(this)}>
                <div className="row">
                  <InputGroup className="col-8">
                    <InputGroup.Append>
                    <InputGroup.Text id="basic-addon15">Program Name</InputGroup.Text>
                    </InputGroup.Append>
                    <Form.Control placeholder="eg. CSCI" name="programName"/>
                  </InputGroup>
                  <Button type="submit" variant="success"><i className="fas fa-check"></i></Button>
                  <Button variant="danger" onClick={this.createProgramHide}><i className="fas fa-times"></i></Button>

                  </div>
                </Form>
                
              </ListGroup.Item>
              :null}
              </ListGroup>
              
            </Card.Body>
            </Card>
          
            {/* <Modal show={this.state.coorInvite} onHide={this.coorInviteHide} centered size="md">
              <Modal.Header><h5>Add Coordinators</h5></Modal.Header>
              <Modal.Body>
                <Form onSubmit={this.inviteCoordinator.bind(this)}>
                  <Form.Label>Email address:</Form.Label>
                  <Form.Control type="email" name = "email" placeholder="Enter email" />
                  <Form.Label>Program:</Form.Label>
                  <Form.Control name="program" placeholder="Enter program name" />
                  <Button className="mt-3 float-right" type="submit">Invite</Button>
                </Form>
              </Modal.Body>
            </Modal>
            <Card className="ml-5 mt-5 float-right" style={{width:"35rem"}}>
                <Card.Header><h3>Invited Coordinators</h3></Card.Header>
                <Card.Body> <ListGroup>{invitedCoordinators}</ListGroup> </Card.Body>
                <Card.Footer><Button onClick={this.coorInviteShow}>Invite Coordinator</Button></Card.Footer>
            </Card>

            <Card className="ml-5 mt-5 float-left" style={{width:"40rem"}}>
                <Card.Header><h3>Registered Coordinators</h3></Card.Header>
                <Card.Body> <ListGroup>{registeredCoordinators}</ListGroup> </Card.Body>
            </Card>  */}
          </section>
        </main>
      </Fragment>
    );
  }
}

SuperAdmin.prototypes = {
  auth: PropTypes.object.isRequired,
  inviteCoordinator: PropTypes.func.isRequired,
  getInvitedCoordinators: PropTypes.func.isRequired,
  getRegisteredCoordinators: PropTypes.func.isRequired
};

const MapStateToProps = state => ({
  auth: state.auth,
  errors: state.errors,
  coordinators: state.coordinators
});

export default connect(MapStateToProps,
    {inviteCoordinator,
    getInvitedCoordinators,
    getRegisteredCoordinators,
    getPrograms,
    createProgram
  })(SuperAdmin);
