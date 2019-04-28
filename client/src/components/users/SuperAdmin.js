import React, { Component, Fragment } from "react";
import SuperAdminLayout from "../layouts/SuperAdminLayout";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Card, Form, Button, ListGroup, InputGroup } from "react-bootstrap";
import {Link} from 'react-router-dom'
import {getPrograms,
  createProgram} from '../../actions/coordinatorAction';
import {isEmpty} from '../../utils/isEmpty'

class SuperAdmin extends Component {

    state = {
        createProgram : false
    }

    componentDidMount(){
      if (!this.props.auth.isAuthenticated || this.props.auth.user.role !== "superuser"){
          this.props.history.push('/login')
        }
        this.props.getPrograms();

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

      let programs = []

      if (this.props.coordinators.programs !== null && 
        this.props.coordinators.programs !== undefined){
          programs = this.props.coordinators.programs.map(program => {
            return(
              <Link to={`superuser/programs/${program.programID}`} key={program.programID}>
              <ListGroup.Item >{program.programName}</ListGroup.Item>
              </Link>
            )
          })
        }

    return (
      <Fragment>
        <SuperAdminLayout/>
        <main id="main" className="m-5">
          <section className="panel important m-5">
          <Card>
            <Card.Header><h2 style={{textAlign:'center'}}>Programs <button className="float-right"
            onClick={this.createProgramShow}><i className="far fa-plus"></i></button></h2></Card.Header>
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
    {getPrograms,
    createProgram
  })(SuperAdmin);
