import React, { Component } from 'react'
import {connect} from 'react-redux'
import AdminLayout from '../layouts/SuperAdminLayout'
import {getInvitedCoordinators,
   getRegisteredCoordinators, 
   inviteCoordinator,
  deleteCoordinator,
  uninviteCoordinator  
  } from '../../actions/coordinatorAction'
import {ListGroup, Card, Modal, Form, Button, InputGroup, CardGroup, Badge} from 'react-bootstrap'
import {isEmpty} from '../../utils/isEmpty'
import Delete from "../../utils/Delete";


class ProgramCoordinators extends Component {
  
  state = {
    coorInvite : false,
    createProgram : false,
    corName:"",
    corID:""
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
}

coorInviteShow = () => {
  this.setState({coorInvite:true})
}


coorInviteHide = () => {
  this.setState({coorInvite:false})
}

deleteShow = e => {
  console.log(e.target.name)
  this.setState({
    corName: e.target.value,
    corID: e.target.name,
    deleteShow: true
  });
};

deleteHide = () => {
  this.setState({ deleteShow: false });
};

corDeleteHandler = () => {
  console.log(this.state)
  this.props.deleteCoordinator({cordID:this.state.corID},this.props.match.params.programID)
}

unInvite = e => {
  console.log(e.target.name)
  console.log(e.target.value)
  this.props.uninviteCoordinator(e.target.value,{corEmail:e.target.name})
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
                  <button
                  style={{ border: "none", background: "none" }}
                  name={coordinator.corID}
                  value={coordinator.name}
                  onClick={this.deleteShow.bind(this)}
                  className="delete float-right"
                />
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
            let array = this.props.coordinators.invitedCoordinators.invitedCoordinators
            if(array.length > 0){
            invitedCoordinators = array.map((coordinator,index) => {
              return (
                 <ListGroup.Item key={"regstd"+index}>
                <ol className="pl-0">
                  <li className="pl-0">
                   {coordinator}
                  <button
                  style={{ border: "none", background: "none" }}
                  name={coordinator} 
                   value = {this.props.coordinators.invitedCoordinators.programID}
                   onClick={(e)=>this.unInvite(e)}
                  className="delete float-right"
                />
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
     <section className="panel important" id="coordCard">
     <div id="cHeaderDiv">
     <Card.Header className='mb-2'><h3 style={{textAlign:'center',fontSize:'2.5em'}}><strong>Program Coordinators</strong></h3></Card.Header>
     </div>
      <CardGroup>
        <Card>
          <Card.Header><h4>Registered Coordinators</h4></Card.Header>
          <Card.Body>
            <ListGroup>
            {registeredCoordinators}
            </ListGroup>
          </Card.Body>
        </Card>

        <Card>
          <Card.Header><h4>Invited Coordinators
          <Button className="float-right" type="submit" onClick={this.coorInviteShow}>
          <i className="fas fa-plus"></i></Button>
            </h4>
            </Card.Header>
          <Card.Body>
            <ListGroup>
            {invitedCoordinators}
            </ListGroup>
          </Card.Body>

        </Card>
        </CardGroup>
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
      <Delete
          hide={this.deleteHide}
          show={this.state.deleteShow}
          value="Program Coordinator"
          name={this.state.corName}
          delete={this.corDeleteHandler}
        />
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
    inviteCoordinator,
    deleteCoordinator,
    uninviteCoordinator
  })(ProgramCoordinators)
