import React, { Component } from "react";
import { connect } from "react-redux";
import { getMeasureRubricReport } from "../../actions/assessmentCycleAction";
import { isEmpty } from "../../utils/isEmpty";
import PropTypes from "prop-types";

class MeasureReport extends Component {
  componentDidMount() {
    this.props.getMeasureRubricReport(this.props.match.params.measureID);
  }

  render() {
    console.log(this.props);

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
              <th key={"criteria" + index}>{criteria.criteriaDescription}  {weighted ?  `(${criteria.criteriaWeight}%)` :null } </th>
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
            return <td key={"critIdx"+index} className={colour}>{details[criteria]}</td>;
          });
        };

      const criteriaAvg = details => {
        return criterias.map((criteria,index) => {
          return <td key={"criAvg"+index}>{details[criteria]}</td>;
        });
      };

      measureReport.push(
        <thead key="tableHead">
          <tr>
            <th>Class</th>
            <th>Student</th>
            <th>Evaluator</th>
            {rubricCriterias()}
            <th>Overall Score</th>
            <th>Average Score</th>
          </tr>
        </thead>
      );

      const reportBody = [];

      reportBody.push(
        this.props.cycles.measureReport.results.map((student,index) => {
          return (
            <tr key={"studSco"+index}>
              <td>{student.class}</td>
              <td>{student.studentName}</td>
              <td>{student.evalName}</td>
              {criteriaScores(student)}
              <td>{student.rubricScore}</td>
              <td>{student.averageScore}</td>
            </tr>
          );
        })
      );
      const avgDetails = this.props.cycles.measureReport.classAverage;
      reportBody.push(
        <tr key="avgDtl">
          <td colSpan="3">Class avg.</td>
          {criteriaAvg(avgDetails)}
          <td>{avgDetails.averageScore}</td>
          <td>{avgDetails.rubricScore}</td>
        </tr>
      );
      const passingCounts = this.props.cycles.measureReport.passingCounts;
      reportBody.push(
        <tr key="passCt">
          <td colSpan="3">Number >= {passPoint}</td>
          {criteriaAvg(passingCounts)}
          <td>{passingCounts.rubricScore}</td>
          <td>{passingCounts.averageScore}</td>
        </tr>
      );
      reportBody.push(
        <tr key="evalNo">
          <td colSpan="3">Number of Evaluations</td>
          {criterias.map((item,idx) => {
            return (
              <td key={"new"+idx}>{this.props.cycles.measureReport.numberOfEvaluations}</td>
            );
          })}
          <td>{this.props.cycles.measureReport.numberOfEvaluations}</td>
          <td>{this.props.cycles.measureReport.numberOfUniqueStudents}</td>
        </tr>
      );
      const passingPercentages = this.props.cycles.measureReport
        .passingPercentages;
      reportBody.push(
        <tr key="passPer">
          <td colSpan="3">% >= {passPoint}</td>
          {criteriaAvg(passingPercentages)}
          <td>{passingPercentages.rubricScore}</td>
          <td>{passingPercentages.averageScore}</td>
        </tr>
      );

      measureReport.push(<tbody key="tableBody">{reportBody}</tbody>);

      measureReport = (
        <table id="measureReport" className="table table-striped" key="reportTable">
          {measureReport}
        </table>
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
