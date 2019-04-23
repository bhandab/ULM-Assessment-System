import React, { Component } from 'react'
import {connect} from 'react-redux'
import AdminLayout from '../layouts/SuperAdminLayout'
import {getInvitedCoordinators, getRegisteredCoordinators, inviteCoordinator} from '../../actions/coordinatorAction'
import {ListGroup, Card, Modal, Form, Button, InputGroup} from 'react-bootstrap'
import {isEmpty} from '../../utils/isEmpty'

class ProgramCoordinators extends Component {
  
  state = {
    coorInvite : false,
    createProgram : false
}
  componentDidMount(){
    console.log("component did mount")
    const programID = this.props.match.params.programID
    this.props.getRegisteredCoordinators(programID)
    this.props.getInvitedCoordinators(programID)

  }

  inviteCoordinator = e => {
    e.preventDefault();
    const email = e.target.email.value
    const body = {
        coordinatorEmail: email,
        programID: this.props.match.params.programID
    }
    this.props.inviteCoordinator(body)
    this.setState({coorInvite:false})
    if(isEmpty(this.props.errors) === false){
        window.alert("Coordinator successfully invited")

    }
    else{
        window.alert(this.props.errors.errors)
    }
}

coorInviteShow = () => {
  this.setState({coorInvite:true})
}


coorInviteHide = () => {
  this.setState({coorInvite:false})
}

  
    render() {
      console.log(this.props)
      let registeredCoordinators = null
      let invitedCoordinators = null

      if(this.props.coordinators.registeredCoordinators !== null &&
        this.props.coordinators.registeredCoordinators !== undefined){
          let array = this.props.coordinators.registeredCoordinators
          if(array.length > 0){
          registeredCoordinators = this.props.coordinators.registeredCoordinators.map((coordinator,index) => {
            return (
              <ListGroup.Item key = {index}>
                <ol className="pl-0">
                  <li className="pl-0">
                  Name: {coordinator.name}
                  </li>
                <li className="pl-0">
                Email:{coordinator.email}
                </li>
                
                </ol>
              </ListGroup.Item>
            )
          })
        }
          else{
            registeredCoordinators = 
            <ListGroup.Item>
            <ol className="pl-0">
                  <li className="pl-0 text-danger">
                  Not Present
                  </li>
                </ol>
        </ListGroup.Item>
        }
        }
        
        if(this.props.coordinators.invitedCoordinators !== null &&
          this.props.coordinators.invitedCoordinators !== undefined){
            let array = this.props.coordinators.invitedCoordinators
            if(array.length > 0){
            invitedCoordinators = array.map((coordinator,index) => {
              return (
                 <ListGroup.Item key={"regstd"+index}>
                <ol className="pl-0">
                  <li className="pl-0">
                   {coordinator}
                  </li>
                </ol>
              </ListGroup.Item>
              )
            })
          }
            else{
              invitedCoordinators = 
              <ListGroup.Item>
                <ol className="pl-0">
                  <li className="pl-0 text-danger">
                  Not Present
                  </li>
                </ol>
              
            </ListGroup.Item>
          }
          }
    
    return (
      <>
      <AdminLayout/>
      <main>
     <section className="panel important">
     <Card>
      <Card.Header><h3 style={{textAlign:'center'}}>Program Coordinators</h3></Card.Header>
      <Card.Body className="row">
        <Card className="col-5 ml-5">
          <Card.Header><h4>Registered Coordinators</h4></Card.Header>
          <Card.Body>
            <ListGroup>
            {registeredCoordinators}
            </ListGroup>
          </Card.Body>
        </Card>
        <Card className="col-5 ml-5">
          <Card.Header><h4>Invited Coordinators
          <Button className="float-right" type="submit" onClick={this.coorInviteShow}>
          <i className="fas fa-plus"></i></Button>
            </h4></Card.Header>
          <Card.Body>
            <ListGroup>
            {invitedCoordinators}
            </ListGroup>
          </Card.Body>

        </Card>
      </Card.Body>
     </Card>
     </section>
     <Modal show={this.state.coorInvite} onHide={this.coorInviteHide} centered size="md">
              <Modal.Header><h4>Invite Coordinator</h4></Modal.Header>
              <Modal.Body>
                <Form onSubmit={this.inviteCoordinator.bind(this)}>
                  <InputGroup>
                  <InputGroup.Append>
                    <InputGroup.Text>
                    Email
                    </InputGroup.Text>
                  </InputGroup.Append>
                  <Form.Control type="email" name = "email" placeholder="Enter email" />
                  </InputGroup>
                  <Button className="mt-3 float-right" type="submit">Invite</Button>
                </Form>
              </Modal.Body>
      </Modal>
     </main>
     </>
    )
  }
}

const MapStateToProps = state => ({
  auth:state.auth,
  errors:state.errors,
  coordinators:state.coordinators
})

export default connect (MapStateToProps,
  {
    getInvitedCoordinators,
    getRegisteredCoordinators,
    inviteCoordinator
  })(ProgramCoordinators)
