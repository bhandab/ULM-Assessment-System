import React, { Component } from 'react'
import {Card, Button, Table} from 'react-bootstrap'
import {connect} from 'react-redux'
import PropTypes from 'prop-types'
import {Link} from 'react-router-dom'
import {ListGroup} from 'react-bootstrap'
import {getAssessmentCycles} from '../../actions/assessmentCycleAction'
import {getCordActivity} from '../../actions/activityAction'

 class Dashboard extends Component {

componentDidMount(){
  if (
    !this.props.auth.isAuthenticated &&
    this.props.auth.user.role !== "coordinator"
  ) {
    this.props.history.push("/login");
  }
  this.props.getAssessmentCycles();
  this.props.getCordActivity();

}
  render() {
    let workingCycle = null
    let logs = null
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
                workingCycle = <Link className="float-right" to={{
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

  if(!this.props.logs.logLoading ) {
      const shortLogs = this.props.logs.coordinatorLogs.logs.slice(0,10)
     logs = shortLogs.map((log,index) => {
      return (
        <tr key={"logs"+index}>
          <td>{log.time}</td>
          <td>{log.activity}</td>
        </tr>
      )
    })
  }

    return (
      <section className="panel important border border-info rounded p-3">
      <Card>
      <Card.Header><h1 style={{textAlign:"center"}}> WELCOME TO ULM STUDENT EVALUATION SYSTEM </h1> </Card.Header>
      
      <Card.Body>
        <ListGroup>
          <Card.Header><h2>Active Cycles {workingCycle}</h2></Card.Header>
          {activeCyclesList}
        </ListGroup>
      </Card.Body>
      </Card>
      <Card className="mt-5">
        <Card.Header><h3>Recent Activities</h3></Card.Header>
        <Card.Body>
          <Table style={{fontSize:'17px'}} striped borderless >
            <thead>
              <tr>
                <th>Time</th>
                <th>Activity</th>
              </tr>
            </thead>
            <tbody>
              {logs}
            </tbody>
          </Table >
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
  cycles:state.cycles,
  logs: state.logs,
  errors: state.errors
})

export default connect (MapStateToProps,
  {getAssessmentCycles,
    getCordActivity
  })(Dashboard)
