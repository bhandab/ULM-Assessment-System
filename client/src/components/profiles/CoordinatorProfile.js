import React, { Component } from 'react'
import {connect} from 'react-redux'
import {Card, ListGroup} from 'react-bootstrap'
import {getMeasures} from '../../actions/measuresAction'
import {getOutcomes} from '../../actions/outcomesAction'


 class CoordinatorProfile extends Component {

  state={
    measures:false,
    outcomes:false
  }

  componentDidMount(){
  }


  render() {

    return (
      <section className="panel important">
      <Card>
        <Card.Header as="h1" className="text-center">
        Coordinator Profile
        
        </Card.Header>
        <Card.Body>
          <ListGroup>
            <ListGroup.Item>
            <h3>Name: {this.props.auth.user.name}</h3>
            </ListGroup.Item>
            <ListGroup.Item>
              <h3>Email: {this.props.auth.user.email}</h3>
            </ListGroup.Item>
            <ListGroup.Item>
              <h3>Program: {this.props.auth.user.programName}</h3>
            </ListGroup.Item>
            <ListGroup.Item>
              <h3>Role: {this.props.auth.user.role}</h3>
            </ListGroup.Item>
          
          </ListGroup>
        </Card.Body>
      </Card>
      </section>
     
    )
  }
}

const MapStateToProps = state => ({
    auth:state.auth,
    errors:state.errors,
    outcomes: state.outcomes,
    measures: state.measures
  })
  

export default connect (MapStateToProps,
  {
    getMeasures,
    getOutcomes
  })(CoordinatorProfile)