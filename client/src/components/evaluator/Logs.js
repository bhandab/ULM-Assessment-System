import React, { Component } from 'react'
import {Card, Button, Table} from 'react-bootstrap'
import {connect} from 'react-redux'
import PropTypes from 'prop-types'
import {getEvalActivity} from '../../actions/activityAction'


 class Logs extends Component {
  
    componentDidMount(){
        if (
          !this.props.auth.isAuthenticated &&
          this.props.auth.user.role !== "evaluator"
        ) {
          this.props.history.push("/login");
        }
        this.props.getEvalActivity();
      
      }
      
    render() {
        let logs = null

        if(!this.props.logs.logLoading ) {
            const shortLogs = this.props.logs.evalLogs.logs
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
      <section className="panel important">
      <Card id="log-card">
        <Card.Header style={{textAlign:'center'}}><h3>Activity Logs
            <Button className="float-right" onClick={()=>this.props.history.goBack()}><i className="fas fa-times"></i></Button>
            </h3></Card.Header>
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
Logs.propTypes = {
    auth:PropTypes.object.isRequired
  }
  
  const MapStateToProps = state => ({
    auth: state.auth,
    logs: state.logs,
    errors: state.errors
  })
  
  export default connect (MapStateToProps,
    {
      getEvalActivity
    })(Logs)
  