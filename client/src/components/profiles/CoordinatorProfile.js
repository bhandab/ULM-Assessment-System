import React, { Component } from 'react'
import {connect} from 'react-redux'
import {Card, ListGroup, Button, Popover, OverlayTrigger, Spinner,Modal} from 'react-bootstrap'
import {getMeasures} from '../../actions/measuresAction'
import {getOutcomes} from '../../actions/outcomesAction'


 class CoordinatorProfile extends Component {

  state={
    measures:false,
    outcomes:false
  }

  componentDidMount(){
    this.props.getMeasures()
    this.props.getOutcomes()
  }

  measuresShow = () => {
    this.setState({measures:true})
  }
  measuresHide = () => {
    this.setState({measures:false})
  }

  outcomesShow = () => {
    this.setState({outcomes:true})
  }
  outcomesHide = () => {
    this.setState({outcomes:false})
  }

  render() {
      
    let measuresList = <Spinner animation='border' variant="primary"></Spinner>
    let outcomesList = null

    let popover = null

    if (this.props.measures.measures === null ) {
        measuresList = <Spinner animation='border' variant="primary"></Spinner>
    }

    else {
        if(this.props.measures.measures.length === 0){
            measuresList = <ListGroup.Item >No Measures Present</ListGroup.Item>
        }
        else {
        measuresList = this.props.measures.measures.map((measure, index) =>
            <ListGroup.Item  key={index}>{measure.measureDescription}</ListGroup.Item>
        )
        }
    }

        if (this.props.outcomes.outcomes === null) {
            outcomesList = <Spinner animation='border' variant="primary"></Spinner>
        }
        else {
            outcomesList = this.props.outcomes.outcomes.map( (outcome, index) =>
                <ListGroup.Item className="list-group-item" key={index}>{outcome}</ListGroup.Item>
            )
            if(outcomesList.length === 0) {
                outcomesList = <ListGroup.Item className="list-group-item" key="0">No Outcomes Present</ListGroup.Item>
            }
        }
      
       popover = (
        <Popover id="popover-basic" title="Details">
          <Button variant="outline-secondary" className="col-12" onClick={this.outcomesShow}>View My Outcomes </Button>
          <Button variant="outline-secondary" className="col-12" onClick={this.measuresShow}>View My Measures</Button>
        </Popover>
      );

    return (
      <section className="panel important">
      <Card>
        <Card.Header as="h1" className="text-center">
        Coordinator Profile
        <OverlayTrigger trigger="click" placement="left" overlay={popover}>
        <i className="fas fa-ellipsis-v float-right" id="viewMoreProfile"></i>
        </OverlayTrigger>
        
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
       


        <Modal show={this.state.measures} onHide={this.measuresHide} centered size="lg">
          <Modal.Header closeButton className="text-center"><h3 className="text-center">List of Performance Measures</h3></Modal.Header>
          <Modal.Body>
          <ListGroup>
          {measuresList}
        </ListGroup>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="danger" className="float-right" onClick={this.measuresHide}>Close</Button>
          </Modal.Footer>
        </Modal>

        
        <Modal show={this.state.outcomes} onHide={this.outcomesHide} centered size="lg">
          <Modal.Header closeButton><h3 className="text-center">List of Outcomes</h3></Modal.Header>
          <Modal.Body>
          <ListGroup>
          {outcomesList}
        </ListGroup>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="danger" className="float-right">Close</Button>
          </Modal.Footer>
        </Modal>
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