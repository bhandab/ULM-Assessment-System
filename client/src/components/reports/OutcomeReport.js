import React, { Component } from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {getOutcomesMeasures} from '../../actions/assessmentCycleAction';
import {CardGroup, Card, ListGroup} from 'react-bootstrap'

 class OutcomeReport extends Component {

    componentDidMount(){
        const cycleID = this.props.match.params.cycleID
        const outcomeID = this.props.match.params.outcomeID
        
        this.props.getOutcomesMeasures(cycleID,outcomeID)
    }

    getPercentage(part,total){
        if(total !== 0){
            if(part !== 0){
                const per = ((part/total)*100).toFixed(2)
                return per+"% ("+part+" out of "+total+") of students met the target criteria"
            }
            else{
                return `0% (0 out of ${total}) of students met the target criteria`
            }
        }
        return 'No students were evaluated!'
    }

  render() {

    let outcomeTitle = null
    let measures = null
    let courseSet = []


    if(!this.props.cycles.cycleLoading){
        const outcomeMeasures = this.props.cycles.outcomeMeasures

        outcomeTitle = outcomeMeasures.outcomeName
        outcomeMeasures.measures.forEach(measure => {
            if(!courseSet.includes(measure.courseAssociated) && measure.courseAssociated !== ""){
                courseSet.push(measure.courseAssociated)
            }
        })
        console.log(courseSet)
       measures =  
       <div style={{color:"black"}}>
            <Card >
                <Card.Header style={{textAlign:"center"}}><h2>Outcome {outcomeMeasures.outcomeID}</h2></Card.Header>
                <Card.Body>
                   <h3> {outcomeTitle} </h3>
                </Card.Body>
            </Card>
            <Card >
                <Card.Header style={{textAlign:"center"}}><h2>Related Courses</h2></Card.Header>
                <Card.Body>
                    <div className="row ml-2">
                        {courseSet.map((course,index) => {
                            return(
                                <h4 key={"crs"+index}>{course},&nbsp; </h4>
                            )
                        })}
                    </div>
                </Card.Body>
            </Card>
            <Card >
            <Card.Title className="mt-2" style={{textAlign:"center"}}><h2>Measures Of Performance</h2></Card.Title>
            { outcomeMeasures.measures.map((measure,index) => {
                return (
                    <Card>
                        <Card.Header>
                            <h3>
                        {outcomeMeasures.outcomeID}.{index+1}
                        &nbsp;{measure.measureName}
                         </h3>
                        </Card.Header>
                        <Card.Body>
                            <strong>
                                <h4>
                            Result: {this.getPercentage(measure.successCount,measure.evalCount)}
                            </h4>
                            </strong>
                        </Card.Body>
                    </Card>
                )
            })}
            </Card>
            
        </div>
    }



    return (
          <section className="panel important">
          {measures}
          </section>
    )
  }
}

OutcomeReport.propTypes = {
    getOutcomesMeasures: PropTypes.func.isRequired,
    auth: PropTypes.object.isRequired,
  };
  
  const MapStateToProps = state => ({
    cycles: state.cycles,
    errors: state.errors,
    auth: state.auth
  });
  
  export default connect(
    MapStateToProps,
    {
      getOutcomesMeasures,
    }
  )(OutcomeReport);

