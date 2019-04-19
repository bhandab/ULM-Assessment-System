import React, { Component } from "react";
import { connect } from "react-redux";
import {
  getEvaluationRubrics,
  getEvaluatorDetails,
  submitRubricScores,
  updateRubricScores
} from "../../actions/evaluationsAction";
import { getSingleRubric } from "../../actions/rubricsAction";
import PropTypes from "prop-types";
import { ListGroup, Card, Button } from "react-bootstrap";

class Evaluate extends Component {
  state = {
    measureID: "",
    studentID: "",
    measureEvalID: "",
    table:""
  };

  componentDidMount() {
    this.props.getEvaluatorDetails();
    this.props.getEvaluationRubrics();
  }

  componentDidUpdate(prevProps){
    if(this.props.rubric.singleRubric !== prevProps.rubric.singleRubric ){
      const rubricDetails = this.props.rubric.singleRubric.rubricDetails;
      const table = this.createRubric()
    }

    if(this.props.evaluations.rubricScores !== prevProps.evaluations.rubricScores){
    console.log("RUbric Scores Updated")
    this.addScoresToTable()
    }
  }

  checkOut = () =>{
    console.log("From Component did update")
  }

  createRubric = () => {
      const rubricDetails = this.props.rubric.singleRubric.rubricDetails
      let tableHeader = [];
      let table = [];
      let rubricTitle = null;
      let averageScore = 0
      console.log(rubricDetails);


      const weighted = rubricDetails.structureInfo.weighted;

      rubricTitle = rubricDetails.structureInfo.rubricTitle;
      const cols = rubricDetails.scaleInfo.length

      tableHeader.push(
        <th key="row1col1">
          <div>Criteria</div>
        </th>
      );

      for (let i = 0; i < rubricDetails.scaleInfo.length; i++) {
        
        tableHeader.push(
          <th key={"row1col" + (i + 2)}>
            <div>{rubricDetails.scaleInfo[i].scaleValue}</div>
          </th>
        );
      }
      if (weighted === 1) {
        tableHeader.push(
          <th
            className="weight"
            key={"row1col" + (rubricDetails.scaleInfo.length + 2)}
          >
            <div>Weight</div>
          </th>
        );
      }
      tableHeader.push(<th key="score" style={{width:'40px'}}><div>Score</div></th>)
      tableHeader = <tr key={"row" + 1}>{tableHeader}</tr>;
      table.push(tableHeader);

      const tableRows = this.props.rubric.singleRubric.rubricDetails.table;
      for (let j = 0; j < tableRows.length; j++) {
        let cells = [];
        cells.push(
          <td key={"row" + (j + 2) + "col1"}>
           <strong>{rubricDetails.criteriaInfo[j].criteriaDescription}</strong>
          </td>
        );

        const tableCols = tableRows[j];
        for (let k = 0; k < tableCols.length; k++) {
          cells.push(
            <td
              onClick={e => this.scoreClick(e)}
              key={"row" + (j + 2) + "col" + (k + 2)}
              data-criteriaid={tableCols[k].criteriaID}
              data-scaleid={tableCols[k].scaleID}
            >
              >{tableCols[k].cellDescription}
            </td>
          );
        }
        if (weighted === 1) {
          cells.push(
            <td key={"wei" + rubricDetails.criteriaInfo[j].criteriaID}>
              <strong>{rubricDetails.criteriaInfo[j].criteriaWeight}%</strong>
            </td>
          );
        }
        const criteriaID = tableCols[0].criteriaID;
        cells.push(<td key={"score" + j + 2}><strong></strong></td>)
        cells = <tr key={"row" + (j + 2)}>{cells}</tr>;
        table.push(cells);
      }
        table.push(
            <tr key = "avgScore">
              {weighted ? <td colSpan={cols+2}><strong>Average Score</strong></td> :
              <td colSpan={cols+1}><strong>Average Score</strong></td>
            }
                <td><strong></strong></td>
            </tr>
        )
      table = (
        <div>
          <table className="table table-bordered" id="scoreRubricTable">
            <tbody>{table}</tbody>
          </table>
          <Button className="float-right">
            Submit Score
          </Button>
        </div>
      );
      this.setState({table:table})

      return table;
  }

  onClickListener = e => {
    const index = e.target.dataset.idx;
    const measureID = e.target.dataset.measureid;
    const studentID = e.target.dataset.studentid;
    const measureEvalID = e.target.dataset.measureeval;

    this.setState({
      measureID: measureID,
      studentID: studentID,
      measureEvalID: measureEvalID
    });

    this.props.submitRubricScores({
      rubricID: index,
      measureID: measureID,
      studentID: studentID,
      measureEvalID: measureEvalID,
    });

    
    // this.props.getSingleRubric(index, true);
  };

  getStudents = (index, name) => {
    let students = [];
    if (
      (this.props.evaluations.evaluationDetails !== null) &
      (this.props.evaluations.evaluationDetails !== undefined)
    ) {
      students = this.props.evaluations.evaluationDetails.map(
        (student, studentIndex) => {
          if (name === student.rubricName) {
            return (
              <ListGroup.Item
                className="students"
                onClick={this.onClickListener.bind(this)}
                data-idx={student.rubricID}
                data-measureid={student.measureID}
                data-studentid={student.studentID}
                data-measureeval={student.measureEvalID}
                key={student.studentID}
              >
                {student.studentName}
              </ListGroup.Item>
            );
          } else {
            return null;
          }
        }
      );
    }
    return students;
  };

getCriteriaWeight  = (criteria) => {
    console.log(typeof criteria)
    console.log(criteria)
    const criteriaInfo = this.props.rubric.singleRubric.rubricDetails.criteriaInfo.find(item=>{
        console.log(item)
        return item.criteriaID+"" === criteria
    })
    return criteriaInfo.criteriaWeight
}

addScoresToTable = () => {
  let sum = 0;
  const tableRows = document.getElementById('scoreRubricTable').rows
  const rowLength = tableRows.length
  console.log(rowLength)
  this.props.evaluations.rubricScores.forEach((criteria,index) => {
    const cells = tableRows[index+1].cells
    const cellLength = cells.length
    const lastCell = cells[cellLength - 1]
    console.log(lastCell)
    lastCell.innerHTML = criteria.criteriaScore
    sum += criteria.criteriaScore
  })
  if(!this.props.rubric.singleRubric.rubricDetails.structureInfo.weighted){
    sum = sum / this.props.evaluations.rubricScores.length
  }
  tableRows[rowLength - 1].cells[1].innerHTML= parseFloat(sum.toFixed(2))
  

  

}

scoreClick = e => {
  let avgScore = 0
  const selectedCriteria = e.target.dataset.criteriaid;
  const selectedScale = e.target.dataset.scaleid;
  const rubric = this.props.rubric.singleRubric.rubricDetails.structureInfo
  const weighted = rubric.weighted
  
  const scaleInfo = this.props.rubric.singleRubric.rubricDetails.scaleInfo.find(
    item => {
      return item.scaleID == selectedScale;
    }
  );
  let score = scaleInfo.scaleValue

  if(weighted){
    score = scaleInfo.scaleValue * this.getCriteriaWeight(selectedCriteria)/100;
  }

 // avgScore += score
  
  const body = {
  rubricID: this.props.rubric.singleRubric.rubricDetails.structureInfo.rubricID,
  measureID: this.state.measureID + "",
  studentID: this.state.studentID + "",
  measureEvalID: this.state.measureEvalID,
  criteriaID: selectedCriteria,
  criteriaScore: score,
  avgScore: avgScore
  }
  console.log(body)
  // console.log(avgScore)
  this.props.updateRubricScores(body)
};

rubricHeaderClick = e => {
  
  console.log(e.target.value)
  this.props.getSingleRubric(e.target.value, true);
}


  render() {
    let rubrics = [];
    let rubricTable = null;
    let avgScore = 0;

    console.log(this.state)

    if (this.props.evaluations.evaluationRubrics !== null) {
      rubrics = this.props.evaluations.evaluationRubrics.map(
        (rubric, index) => {
          return (
            <div className="card" key={index}>
              <div className="card-header" id={"rubric" + index}>
                <h5 className="mb-0">
                  <button
                    className="btn btn-link"
                    type="button"
                    data-toggle="collapse"
                    data-target={"#collapse" + index}
                    aria-expanded="true"
                    aria-controls={"collapse" + index}
                    value={rubric.rubricID}
                    onClick={this.rubricHeaderClick.bind(this)}
                  >
                    {rubric.rubricName}
                  </button>
                </h5>
              </div>
              <div
                id={"collapse" + index}
                className="collapse"
                aria-labelledby={"heading" + index}
                data-parent="#assignedRubric"
              >
                <div className="card-body">
                  <ListGroup>
                    {this.getStudents(index, rubric.rubricName)}
                  </ListGroup>
                </div>
              </div>
            </div>
          );
        }
      );
    }

   
    

    const submitScores = () => {
      console.log("Congratulations!! You clicked the button.")
    };

    console.log(this.props);

    return (
      <section className="panel important">
        <Card id="rubricStudent">
          <Card.Header className="row">
            <h3 className="col-3">Assigned Rubrics</h3>
          </Card.Header>
          <Card.Body className="row">
            <div className="accordion col-3" id="assignedRubric">
              {rubrics}
            </div>
            <div className="col-9">{this.state.table}</div>
          </Card.Body>
        </Card>
      </section>
    );
  }
}

Evaluate.propTypes = {
  auth: PropTypes.object.isRequired,
  getEvaluationRubrics: PropTypes.func.isRequired,
  getEvaluatorDetails: PropTypes.func.isRequired,
  getSingleRubric: PropTypes.func.isRequired,
  submitRubricScores: PropTypes.func.isRequired,
  updateRubricScores: PropTypes.func.isRequired
};

const MapStateToProps = state => ({
  auth: state.auth,
  evaluationRubrics: state.evaluationRubrics,
  evaluationDetails: state.evaluationDetails,
  evaluations: state.evaluations,
  errors: state.errors,
  rubric: state.rubric
});

export default connect(
  MapStateToProps,
  {
    getEvaluationRubrics,
    getEvaluatorDetails,
    getSingleRubric,
    submitRubricScores,
    updateRubricScores
  }
)(Evaluate);
