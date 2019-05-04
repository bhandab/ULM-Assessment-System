import React, { Component } from 'react'
import {Card, Button, Table} from 'react-bootstrap'
import {connect} from 'react-redux'
import PropTypes from 'prop-types'
import {getCordActivity} from '../../actions/activityAction'


 class Logs extends Component {
   state = {
     logs: []
   }
  
    componentDidMount(){
        if (
          !this.props.auth.isAuthenticated &&
          this.props.auth.user.role !== "coordinator"
        ) {
          this.props.history.push("/login");
        }
        this.props.getCordActivity();
      
      }

      componentDidUpdate(prevProps){
        if(!this.props.logs.logLoading){
          if(this.props.logs.coordinatorLogs !== prevProps.logs.coordinatorLogs){
              this.setState({logs:this.props.logs.coordinatorLogs.logs})
          }
        }
      }      

      searchHandle = (e) => {
        if(!this.props.logs.logLoading){
        console.log(e.target.value)
        const allLogs = this.props.logs.coordinatorLogs.logs
        const filterLogs = allLogs.filter(log => {
          return log.activity.includes(e.target.value)
        })
        this.setState({logs:filterLogs})
      }
    }
      
      
    render() {
        let logs = null

        if(!this.props.logs.logLoading ) {
            const shortLogs = this.state.logs
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
      <section className="panem important">
      <Card className="mt-3" id="log-card">
        <Card.Header style={{textAlign:'center'}}><h3>  <div className="float-left row">
        <i className="fas fa-search mt-1 mr-2"></i>
          <input type="text" placeholder="Activity" onChange={this.searchHandle.bind(this)}/>
          </div>
          Activity Logs
        <Button className="float-right" onClick={()=>this.props.history.goBack()}><i className="fas fa-times"></i></Button>
          </h3>
        
          </Card.Header>
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
      getCordActivity
    })(Logs)
  