import React, { Component } from 'react'
import {Card, Button} from 'react-bootstrap'
import {connect} from 'react-redux'
import PropTypes from 'prop-types'
import {Link} from 'react-router-dom'
import {ListGroup} from 'react-bootstrap'
import {getAssessmentCycles} from '../../actions/assessmentCycleAction'

 class Dashboard extends Component {

componentDidMount(){
  if (
    !this.props.auth.isAuthenticated &&
    this.props.auth.user.role !== "coordinator"
  ) {
    this.props.history.push("/login");
  }
  this.props.getAssessmentCycles();

}
  render() {
    let workingCycle = null

    let activeCyclesList = null;
    if (
      this.props.cycles.cycles !== null &&
      this.props.cycles.cycles !== undefined
    ) {
      if (
        this.props.cycles.cycles.cycles !== null &&
        this.props.cycles.cycles.cycles !== undefined
      ) {
        activeCyclesList = this.props.cycles.cycles.cycles.map((cycle,index) => {
          if(!cycle.isClosed){
              if(index === 0) {
                workingCycle = <Link to={{
                  pathname: "/admin/cycles/cycle/" + cycle.cycleID
                }}><Button>Current Cycle</Button></Link>
              }
          return (
          <ListGroup.Item key={cycle.cycleID}>
            <Link
              params={cycle.cycleName}
              name={cycle.cycleID}
              to={{
                pathname: "/admin/cycles/cycle/" + cycle.cycleID
              }}
            >
              {cycle.cycleName}
            </Link>
          </ListGroup.Item>
        )
            }
            else {
              return null
            }
      });
    }
  }

    console.log(this.props)
    return (
      <section className="panel important border border-info rounded p-3">
      <Card>
      <Card.Header><h1 style={{textAlign:"center"}}> WELCOME TO ULM STUDENT EVALUATION SYSTEM </h1> </Card.Header>
      
      <Card.Body>
        <ListGroup>
          <Card.Header>Active Cycles <span className="float-right">{workingCycle}</span></Card.Header>
          {activeCyclesList}
        </ListGroup>
      </Card.Body>
      </Card>
      <Card className="mt-3">
        <Card.Header>Recent Activities</Card.Header>
        <Card.Body>
          Recent Activities Goes Here
        </Card.Body>
      </Card>
      </section>
    )
  }
}

Dashboard.propTypes = {
  auth:PropTypes.object.isRequired
}

const MapStateToProps = state => ({
  auth: state.auth,
  cycles:state.cycles
})

export default connect (MapStateToProps,{getAssessmentCycles})(Dashboard)
