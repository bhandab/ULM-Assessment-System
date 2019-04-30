import React, { Component } from "react";
import { connect } from "react-redux";
import { getMeasureRubricReport } from "../../actions/assessmentCycleAction";
import { isEmpty } from "../../utils/isEmpty";
import PropTypes from "prop-types";
import {Card, Table, Button} from 'react-bootstrap'

class MeasureReport extends Component {
  componentDidMount() {
    if (
      !this.props.auth.isAuthenticated &&
      this.props.auth.user.role !== "coordinator"
    ) {
      this.props.history.push("/login");
    }
    this.props.getMeasureRubricReport(this.props.match.params.measureID);
  }

  render() {
    console.log(this.props);

    const cellStyle = {
        fontSize:'1.5em',
        textAlign:'center'
    }

    const headerStyle = {
        fontSize:'1.6em'
    }

    let measureReport = [];

      if (
        this.props.cycles.measureReport !== null &&
        this.props.cycles.measureReport !== undefined &&
        isEmpty(this.props.cycles.measureReport) === false
      ) {
        const passPoint = this.props.cycles.measureReport.threshold;
        const criteriaDesc = this.props.cycles.measureReport.criteriaInfo;
        const criterias = [];
        let colour = "";
        let weighted = this.props.cycles.measureReport.weightedRubric
        const rubricCriterias = () => {
          return criteriaDesc.map((criteria, index) => {
            criterias.push(criteria.criteriaDescription);
            return (
              <th style = {headerStyle} key={"criteria" + index}>{criteria.criteriaDescription}  {weighted ?  `(${criteria.criteriaWeight}%)` :null } </th>
            );
          });
        };
        const criteriaScores = details => {
          return criterias.map((criteria,index) => {
            if (details[criteria] < passPoint) {
              colour = "text-danger";
            } else {
              colour = "text-success";
            }
            return <td style = {cellStyle} key={"critIdx"+index} className={colour}>{details[criteria]}</td>;
          });
        };

      const criteriaAvg = details => {
        return criterias.map((criteria,index) => {
          console.log(details[criteria])
          return <td style = {cellStyle} key={"criAvg"+index}>{details[criteria]}</td>;
        });
      };

      measureReport.push(
        <thead key="tableHead">
          <tr>
            <th style = {headerStyle}>Class</th>
            <th style = {headerStyle}>Student</th>
            <th style = {headerStyle}>Evaluator</th>
            {rubricCriterias()}
            <th style = {headerStyle}>Overall Score</th>
            <th style = {headerStyle}>Average Score</th>
          </tr>
        </thead>
      );

      const reportBody = [];
      const repResults =  this.props.cycles.measureReport.results.length

      reportBody.push(
        this.props.cycles.measureReport.results.map((student,index) => {
          return (
            <tr key={"studSco"+index}>
              { index === 0 ? <td rowSpan={repResults} style = {cellStyle}>{student.class}</td> : null}
              <td style = {cellStyle}>{student.studentName}</td>
              <td style = {cellStyle}>{student.evalName}</td>
              {criteriaScores(student)}
              <td className={student.rubricScore >= passPoint ? "text-success" : "text-danger"} style = {cellStyle}>{student.rubricScore}</td>
              <td className={student.averageScore >= passPoint ? "text-success" : "text-danger"} style = {cellStyle}>{student.averageScore}</td>
            </tr>
          );
        })
      );
      const avgDetails = this.props.cycles.measureReport.classAverage;
      reportBody.push(
        <tr key="avgDtl">
          <td style = {cellStyle} colSpan="3">Class avg.</td>
          {criteriaAvg(avgDetails)}
          <td className={avgDetails.rubricScore >= passPoint ? "text-success" : "text-danger"} style = {cellStyle}>{avgDetails.rubricScore}</td>
              <td className={avgDetails.averageScore >= passPoint ? "text-success" : "text-danger"} style = {cellStyle}>{avgDetails.averageScore}</td>
          
        </tr>
      );
      const passingCounts = this.props.cycles.measureReport.passingCounts;
      reportBody.push(
        <tr key="passCt">
          <td style = {cellStyle} colSpan="3">Number >= {passPoint}</td>
          {criteriaAvg(passingCounts)}
          <td style = {cellStyle}>{passingCounts.rubricScore}</td>
          <td style = {cellStyle}>{passingCounts.averageScore}</td>
        </tr>
      );
      reportBody.push(
        <tr key="evalNo">
          <td style = {cellStyle} colSpan="3">Number of Evaluations</td>
          {criterias.map((item,idx) => {
            return (
              <td style = {cellStyle} key={"new"+idx}>{this.props.cycles.measureReport.numberOfEvaluations}</td>
            );
          })}
          <td style = {cellStyle}>{this.props.cycles.measureReport.numberOfEvaluations}</td>
          <td style = {cellStyle}>{this.props.cycles.measureReport.numberOfUniqueStudents}</td>
        </tr>
      );
      const passingPercentages = this.props.cycles.measureReport
        .passingPercentages;
      reportBody.push(
        <tr key="passPer">
          <td style = {cellStyle} colSpan="3">% >= {passPoint}</td>
          {criteriaAvg(passingPercentages)}
          <td style = {cellStyle}>{passingPercentages.rubricScore}</td>
          <td style = {cellStyle}>{passingPercentages.averageScore}</td>
        </tr>
      );

      measureReport.push(<tbody key="tableBody">{reportBody}</tbody>);

      measureReport = (
        
          <Card>
            <Card.Header style={{textAlign:'center'}}><h2>Measure Report
            <Button className="float-right noprint" onClick={()=> this.props.history.goBack()}>
            <i className="fas fa-times"></i>
            </Button>
            </h2></Card.Header>
            <Card.Body>
            <Table id="measureReport" striped bordered key="reportTable">
              {measureReport}
              </Table>

            </Card.Body>
          </Card>
      );
    }

    return <section className="panel important" key="secn">
    {measureReport}
    </section>;
  }
}

MeasureReport.propTypes = {
  auth: PropTypes.object.isRequired,
  getMeasureRubricReport: PropTypes.func.isRequired
}
const MapStateToProps = state => ({
  auth: state.auth,
  cycles: state.cycles
});

export default connect(
  MapStateToProps,
  { getMeasureRubricReport }
)(MeasureReport);
