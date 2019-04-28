import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { getCycleReport } from "../../actions/reportsAction";
import { Card,Table, Button } from "react-bootstrap";

class CycleReport extends Component {
  componentDidMount() {
    const cycleID = this.props.match.params.cycleID;
    this.props.getCycleReport(cycleID);
  }

  getPercentages(part,total){
      if(total === 0){
          return '0%'
      }
      if(part === 0){
          return '0%'
      }
      const per = ((part/total)*100).toFixed(1)
      return per+'%'
  }

  render() {
    let outcomesKey = [];
    let cycleName = "";
    let tableBody = [];

    console.log(this.props);
    if (this.props.reports.report !== null) {
      let outcomes = this.props.reports.report;
      cycleName = this.props.reports.report.cycleName;
      outcomesKey = Object.keys(this.props.reports.report);
      outcomesKey = outcomesKey.filter(outcome => {
        return outcome !== "cycleName";
      });
              outcomesKey.forEach((key,oIndex) => {
                  
                    let span = true
                    let measures = outcomes[key].measureDetails
                    if(measures.length === 0) {
                        tableBody.push(
                        <tr>
                           <td><strong> {oIndex+1}. {key}</strong></td>
                           <td colSpan="5">No Measures Present</td>
                        </tr>)
                    }
                  
                  measures.forEach((measure,mIndex) => {
                    tableBody.push(
                    <tr key={"measr"+mIndex}>
                        {span ? 
                        <td className="cycRepOutcome" rowSpan={measures.length}>
                           <strong>{key}</strong>
                        </td>
                        : null}
                        <td>{measure.measureDisplayID}</td>
                        <td>{measure.evalCount}</td>
                        <td>{measure.successCount}</td>
                        <td className = {measure.measureStatus ? "text-success" : "bg-warning"}>{this.getPercentages(measure.successCount,measure.evalCount)}</td>
                        <td className = {measure.measureStatus ? "text-success" : "bg-warning"}>{measure.measureStatus ? "Satisfied" : "Not Satisfied"}</td>
                        {span ? 
                        <td className="cycRepOutcome" rowSpan={measures.length}>
                           <strong>related courses</strong>
                        </td>
                        : null}
                    </tr>
                    )
                    span = false
                  })
              })
      console.log(outcomesKey);
    }

    return (
      <section className="panel important">

        <Card>
        <Card.Header>
        <h2 style={{ textAlign: "center" }}>{cycleName}
        <Button className="float-right noprint" onClick={()=> this.props.history.goBack()}>
            <i className="fas fa-times"></i>
            </Button>
        </h2>
        </Card.Header>
        <Card.Body>
        <Table bordered hover id="cycleReport">
          <thead>
            <tr>
              <th>Outcome</th>
              <th>Measure</th>
              <th>Total Evaluations</th>
              <th>Number Meeting Criteria</th>
              <th>% Meeting Criteria</th>
              <th>Result</th>
              <th>Related Courses</th>
            </tr>
          </thead>
          <tbody key="tbod">
              {tableBody}
          </tbody>
        </Table>
        </Card.Body>
        </Card>
      </section>
    );
  }
}

CycleReport.propTypes = {
  auth: PropTypes.object.isRequired
};

const MapStateToProps = state => ({
  errors: state.errors,
  auth: state.auth,
  reports: state.reports
});

export default connect(
  MapStateToProps,
  { getCycleReport }
)(CycleReport);
