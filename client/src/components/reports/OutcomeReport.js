import React, { Component } from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {getOutcomesMeasures} from '../../actions/assessmentCycleAction';
import {Card, Button, Table} from 'react-bootstrap'
import ReactHTMLTableToExcel from 'react-html-table-to-excel'


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
    let measures = []
    let courseSet = []
    let disIndex = window.location.hash.substr(1)
    let table = []


    if(!this.props.cycles.cycleLoading){
        const outcomeMeasures = this.props.cycles.outcomeMeasures
        if(outcomeMeasures !== null){

        outcomeTitle = outcomeMeasures.outcomeName
        outcomeMeasures.measures.forEach(measure => {
            if(!courseSet.includes(measure.courseAssociated) && measure.courseAssociated !== ""){
                courseSet.push(measure.courseAssociated)
            }
        })
       measures.push(
           <tr key="octTitle">
           <td>
            <Card>
                <Card.Header style={{textAlign:"center"}}><h2>Outcome {disIndex}
            </h2></Card.Header>
                <Card.Body>
                   <h3> {outcomeTitle} </h3>
                </Card.Body>
            </Card></td></tr>)
        measures.push(
            <tr key="rltdCrs"><td>
            <Card >
                <Card.Header style={{textAlign:"center"}}><h2>Related Courses</h2></Card.Header>
                <Card.Body>
                    <div className="row ml-2">
                        {this.props.cycles.outcomeMeasures.outcomeCourses.map((course,index) => {
                            return(
                                <h4 key={"crs"+index}>{course.courseCode}{this.props.cycles.outcomeMeasures.outcomeCourses.length-1 !== index ? ',' : null}&nbsp; </h4>
                            )
                        })}
                    </div>
                </Card.Body>
            </Card>
            </td></tr> )
        measures.push(<tr key="msrsAll">
            <td><Card>
            <Card.Title className="mt-2" style={{textAlign:"center"}}><h2>Measures Of Performance</h2></Card.Title>
            {outcomeMeasures.measures.map((measure,index) => {
                return (
                    <Card key={"octRpCard"+index}>
                        <Card.Header>
                            <h2>
                        {disIndex}.{measure.displayIndex}
                        &nbsp;{measure.measureName}
                         </h2>
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
            </td></tr> )

            measures = <Table className="m-0" id="outcomeReport" responsive><tbody>{measures}</tbody></Table>
    }
    }



    return (
          <section className="panel important">
          <Card>
              <Card.Header as="h2">
              <Button className="float-right noprint" onClick={()=> this.props.history.goBack()}>
            <i className="fas fa-times"></i>
            </Button>
            <ReactHTMLTableToExcel
                    id="test-table-xls-button"
                    className="download-table-xls-button btn btn-info float-right mr-3"
                    table="outcomeReport"
                    filename="outcomeReport"
                    sheet="tablexls"
                    buttonText="Download as EXCEL"/>

              </Card.Header>
          </Card>
        <Card.Body>
        {measures}
        </Card.Body>
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

