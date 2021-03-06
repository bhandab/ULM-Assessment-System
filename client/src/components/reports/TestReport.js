import React, { Component } from 'react'
import { connect } from "react-redux";
import { getMeasureTestReport } from "../../actions/assessmentCycleAction";
import PropTypes from "prop-types";
import {Card, Table, Button} from 'react-bootstrap';
import ReactHTMLTableToExcel from 'react-html-table-to-excel';



 class TestReport extends Component {

    componentDidMount() {
        if (
          !this.props.auth.isAuthenticated &&
          this.props.auth.user.role !== "coordinator"
        ) {
          this.props.history.push("/login");
        }
        this.props.getMeasureTestReport(this.props.match.params.measureID);
      }
    
  render() {
      let measureReport = []

      if(!this.props.cycles.cycleLoading &&
        this.props.cycles.measureReport.report !== undefined){
        let header = (
            <thead key={"testHeader"}>
              <tr>
                <th>#</th>
                <th>Student</th>
                <th>Student Email</th>
                <th>Evaluator</th>
                <th>Score</th>
                <th>Status</th>
              </tr>
            </thead>
          );
          measureReport.push(header);
          let body = this.props.cycles.measureReport.report.map(
            (student, index) => {
              let colour = "text-danger";
              if (student.passing) {
                colour = "text-success";
              }
              return (
                <tr key={student.CWID}>
                  <td>{index + 1}</td>
                  <td>{student.studentName}</td>
                  <td>{student.studentEmail}</td>
                  <td>{student.evalName}</td>
                  <td className={colour}>{student.score}</td>
                  {student.passing ? (
                    <td className="text-success">Pass</td>
                  ) : (
                    <td className="text-danger">Fail</td>
                  )}
                </tr>
              );
            }
          );
          body.push(<tr key="testPassing"><td colSpan="6" >Passing Count: {this.props.cycles.measureReport.passingCounts}</td></tr>)
          body.push(<tr  key="passPer"><td  colSpan="6">Passing Percentage: {this.props.cycles.measureReport.passingPercentage}%</td></tr>)

          measureReport.push(<tbody key="testBody">{body}</tbody>);
          measureReport = (
            <Table id = "measureTestReport" striped bordered hover>
              {measureReport}
            </Table>
          );
      }

    return (
      <section className="panel important p-2">
        <Card style={{overflow:'auto'}}>
            <Card.Header style={{textAlign:'center'}}><h2>Measure Report<Button className="float-right noprint" onClick={()=> this.props.history.goBack()}>
            <i className="fas fa-times"></i>
            </Button>
            <ReactHTMLTableToExcel
                    id="test-table-xls-button"
                    className="download-table-xls-button btn btn-info float-right mr-3"
                    table="measureTestReport"
                    filename="measureReport"
                    sheet="tablexls"
                    buttonText="Download as EXCEL"/>
            </h2>
</Card.Header>
            <Card.Body>
        {measureReport}
        </Card.Body>
        </Card>
      </section >
    )
  }
}

TestReport.propTypes = {
    auth: PropTypes.object.isRequired,
    getMeasureTestReport: PropTypes.func.isRequired
  }
  const MapStateToProps = state => ({
    auth: state.auth,
    cycles: state.cycles
  });
  
  export default connect(
    MapStateToProps,
    { getMeasureTestReport }
  )(TestReport);
  
