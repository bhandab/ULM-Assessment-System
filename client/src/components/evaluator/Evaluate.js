import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import {
  getEvaluationRubrics,
  getEvaluatorDetails,
  submitRubricScores,
  updateRubricScores,
  testScores,
  updateTestScores
} from "../../actions/evaluationsAction";
import { getSingleRubric } from "../../actions/rubricsAction";
import PropTypes from "prop-types";
import { ListGroup, Card, Button, Table, Alert, Spinner } from "react-bootstrap";

class Evaluate extends Component {
  state = {
    measureID: "",
    studentID: "",
    rubricID:'',
    measureEvalID: "",
    testName: "",
    table: (
      <div className="alert alert-info">
        <h4>Please Select a Evaluation Tool</h4>
      </div>
    ),
    scoreMap : new Map(),
    scoreObject: [],
    rubricTarget:""
  };

  componentDidMount() {
    this.props.getEvaluatorDetails();
    this.props.getEvaluationRubrics();
  }

  componentDidUpdate(prevProps,prevState) {
    if (this.props.rubric.singleRubric !== prevProps.rubric.singleRubric) {
      this.createRubric();
    }

    if (
      this.props.evaluations.rubricScores !== prevProps.evaluations.rubricScores
    ) {
      let scoreMap = new Map();
      this.props.evaluations.rubricScores.forEach((criteria => {
          scoreMap.set(criteria.criteriaID, criteria.criteriaScore)
      }))
      const scoreObject = []
      scoreMap.forEach((value,key) => {
      scoreObject.push(
        {
          criteriaID: key,
          criteriaScore: value
        }
      )
    })
    console.log(scoreObject)
      this.setState({scoreMap:scoreMap, scoreObject:scoreObject})
    }

      if (this.props.evaluations.testScores !== prevProps.evaluations.testScores) {
         console.log(this.props.evaluations.testScores)
         this.createScoreTable();
      }
      if(this.state.scoreObject !== prevState.scoreObject){
        this.addScoresToTable();
      }
  }

  collapseRubric = (e) => {
    console.log("e.dataset");
  };

  createRubric = () => {
    const rubricDetails = this.props.rubric.singleRubric.rubricDetails;
    let tableHeader = [];
    let table = [];
    const weighted = rubricDetails.structureInfo.weighted;
    const cols = rubricDetails.scaleInfo.length;

    tableHeader.push(
      <th key="row1col1" className="rubricHeaders">
        <div>Criteria</div>
      </th>
    );

    for (let i = 0; i < rubricDetails.scaleInfo.length; i++) {
      tableHeader.push(
        <th key={"row1col" + (i + 2)} className="rubricHeaders">
          <div>{rubricDetails.scaleInfo[i].scaleValue}</div>
        </th>
      );
    }
    if (weighted === 1) {
      tableHeader.push(
        <th
          className="weight rubricHeaders"
          key={"row1col" + (rubricDetails.scaleInfo.length + 2)}
        >
          <div>Weight</div>
        </th>
      );
    }
    tableHeader.push(
      <th key="score" style={{ width: "40px" }} className="rubricHeaders">
        <div>Score</div>
      </th>
    );
    tableHeader = (
      <tr key={"row" + 1} className="headerRow">
        {tableHeader}
      </tr>
    );
    table.push(tableHeader);

    const tableRows = this.props.rubric.singleRubric.rubricDetails.table;
    for (let j = 0; j < tableRows.length; j++) {
      let cells = [];
      cells.push(
        <td className="rubricCriteria" key={"row" + (j + 2) + "col1"}>
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
            className="rubricCells"
          >
            >{tableCols[k].cellDescription}
          </td>
        );
      }
      if (weighted === 1) {
        cells.push(
          <td
            key={"wei" + rubricDetails.criteriaInfo[j].criteriaID}
            className="rubricCells weightCell"
          >
            <strong>{rubricDetails.criteriaInfo[j].criteriaWeight}%</strong>
          </td>
        );
      }
      cells.push(<td key={"score" + j + 2} className="rubricScore" />);
      cells = <tr key={"row" + (j + 2)}>{cells}</tr>;
      table.push(cells);
    }
    table.push(
      <tr key="avgScore">
        {weighted ? (
          <td colSpan={cols + 2} className="avgScore">
            <strong>Average Score</strong>
          </td>
        ) : (
          <td colSpan={cols + 1} className="avgScore">
            <strong>Average Score</strong>
          </td>
        )}
        <td className="rubricScore" />
      </tr>
    );
    table = (
      <Card>
        <Card.Header>
        <h3>{rubricDetails.structureInfo.rubricTitle}</h3>
        <h5 id="evaluatedStudent"> </h5>
        </Card.Header>
        <Card.Body>
        <table className="table table-bordered" id="scoreRubricTable">
          <tbody>{table}</tbody>
        </table>
        </Card.Body>
        <Card.Footer>
        <Button className="float-right" onClick={this.submitScores}>Submit Score</Button>
        </Card.Footer>
      </Card>
    );
    this.setState({ table: table });
  };

  onClickListener = e => {
    const index = e.target.dataset.idx;
    const measureID = e.target.dataset.measureid;
    const studentID = e.target.dataset.studentid;
    const measureEvalID = e.target.dataset.measureeval;

    this.setState({
      measureID: measureID,
      studentID: studentID,
      measureEvalID: measureEvalID,
      rubricID: index
    });

    const student = document.getElementById("evaluatedStudent");
    student.innerHTML = e.target.dataset.studname;

    this.props.submitRubricScores({
      rubricID: index,
      measureID: measureID,
      studentID: studentID,
      measureEvalID: measureEvalID
    });
  };

  getStudents = (index, name) => {
    let students = [];
    if (
      (this.props.evaluations.evaluationDetails !== null) &
      (this.props.evaluations.evaluationDetails !== undefined)
    ) {
      students = this.props.evaluations.evaluationDetails.map(student => {
        if (name === student.rubricName) {
          return (
            <ListGroup.Item
              className="students"
              onClick={this.onClickListener.bind(this)}
              data-idx={student.rubricID}
              data-measureid={student.measureID}
              data-studentid={student.studentID}
              data-measureeval={student.measureEvalID}
              data-studname={student.studentName}
              key={student.studentID}
            >
              {student.studentName}
            </ListGroup.Item>
          );
        } else {
          return null;
        }
      });
    }
    return students;
  };

  getTestStudents = () => {
    return <ListGroup.Item>Item 1</ListGroup.Item>;
  };

  getCriteriaWeight = criteria => {
    console.log(typeof criteria);
    console.log(criteria);
    const criteriaInfo = this.props.rubric.singleRubric.rubricDetails.criteriaInfo.find(
      item => {
        console.log(item);
        return item.criteriaID + "" === criteria;
      }
    );
    return criteriaInfo.criteriaWeight;
  };

  addScoresToTable = () => {
    let sum = 0;
    const tableRows = document.getElementById("scoreRubricTable").rows;
    const rowLength = tableRows.length;
     console.log(this.state.scoreObject);
    this.state.scoreObject.forEach((criteria, index) => {
      const cells = tableRows[index + 1].cells;
      const cellLength = cells.length;
      const lastCell = cells[cellLength - 1];
      // console.log(lastCell);
      lastCell.innerHTML = criteria.criteriaScore;
      sum += criteria.criteriaScore;
    });
    if (!this.props.rubric.singleRubric.rubricDetails.structureInfo.weighted) {
      sum = sum / this.state.scoreObject.length;
    }
    tableRows[rowLength - 1].cells[1].innerHTML = parseFloat(sum.toFixed(2));
  };

  scoreClick = e => {
    let selectedCriteria = e.target.dataset.criteriaid;
    const selectedScale = e.target.dataset.scaleid;
    const rubric = this.props.rubric.singleRubric.rubricDetails.structureInfo;
    const weighted = rubric.weighted;

    const scaleInfo = this.props.rubric.singleRubric.rubricDetails.scaleInfo.find(
      item => {
        return item.scaleID + "" === selectedScale + "";
      }
    );
    let score = scaleInfo.scaleValue;

    if (weighted) {
      score =
        (scaleInfo.scaleValue * this.getCriteriaWeight(selectedCriteria)) / 100;
    }
    const scoreMap = new Map(this.state.scoreMap)
    selectedCriteria = parseInt(selectedCriteria)
    scoreMap.set(selectedCriteria, score)
    const scoreObject = []
    scoreMap.forEach((value,key) => {
    scoreObject.push(
      {
        criteriaID: key,
        criteriaScore: value
      }
    )
  })
    this.setState({scoreMap:scoreMap, scoreObject:scoreObject})
    // this.props.updateRubricScores();
  };

  rubricHeaderClick = e => {
    console.log(e.target.value);
    this.props.getSingleRubric(e.target.value, true);
    this.setState({rubricTarget:","+e.target.dataset.target})
    console.log(e.target.dataset.target)
  };

  testTitleClick = e => {
    const testID = e.target.value;
    const spinner = (
      <Fragment>
      <Spinner animation="grow" variant="primary" />
      <Spinner animation="grow" variant="secondary" />
      <Spinner animation="grow" variant="success" />
    </Fragment>
    )
    this.setState({ testName: e.target.name, table:spinner });
    this.props.testScores({ testID });
  };

  toScoreList() {
    const scores = this.props.evaluations.testScores.scores;
    if (scores.length < 1) {
      return (
        <tr>
          <td colSpan="4" className="mt-3">
            <Alert variant="warning">No Students Assigned</Alert>
          </td>
        </tr>
      );
    }
    return scores.map((student, index) => {
      let initScore = student.testScore;
      let initStatus = student.testScoreStatus;
      // console.log(initStatus)
      if (student.projectedResult !== null) {
        if (initScore === null) {
          initScore = 0;
        }
      } else {
        if (initStatus === null) {
          initStatus = "fail"
        }
        else {
          if(initStatus === 1){
            initStatus = "pass"
          }
          else {
            initStatus = "fail"
          }

        }
      }
      
      return (
        <tr key={"scr" + index}>
          <td className="rubricCells">{index + 1}</td>
          <td className="rubricCells">{student.lastName}</td>
          <td className="rubricCells">{student.firstName}</td>
          <td className="rubricCells">{student.email}</td>
          {student.projectedResult !== null ? (
            <td className="rubricCells" id="evalTestScore">
              <input
                type="number"
                data-measureid={student.measureID}
                data-testtype="scored"
                data-studid={student.studentID}
                onChange={this.testScoreUpdate.bind(this)}
                defaultValue={initScore}
              />
            </td>
          ) : (
            <td className="rubricCells" id="evalTestScore">
              <select
                type="number"
                data-measureid={student.measureID}
                data-testtype="pass"
                data-studid={student.studentID}
                onChange={this.testScoreUpdate.bind(this)}
                defaultValue={student.testScoreStatus === null ? 0 : student.testScoreStatus}
              >
                <option value={1}>pass</option>
                <option value={0}>fail</option>
              </select>
            </td>
          )}
        </tr>
      );
    });
  }

  testScoreUpdate = e => {
    const measureID = e.target.dataset.measureid;
    const studentID = e.target.dataset.studid;
    let scoreStatus = null;
    let testScore = null;
    if (e.target.dataset.testtype === "scored") {
      testScore = e.target.value;
    } else {
      scoreStatus = e.target.value;
    }
    const body = {
      measureID,
      studentID,
      scoreStatus,
      testScore
    };
    console.log(body);
    this.props.updateTestScores(this.props.evaluations.testScores.testID,body);
    this.createScoreTable()
  };

  createScoreTable = () => {
    const scoreTable = (
      <Card>
        <Card.Header>
          <h3 style={{ textAlign: "center" }}>{this.state.testName}</h3>
        </Card.Header>
        <Card.Body>
          <Table bordered hover id="evalScoreTable">
            <thead>
              <tr className="headerRow">
                <th>#</th>
                <th>Last Name</th>
                <th>First Name</th>
                <th>Email</th>
                <th id="scoreHeader">Score</th>
              </tr>
            </thead>
            <tbody>{this.toScoreList()}</tbody>
          </Table>
        </Card.Body>
      </Card>
    );
    this.setState({ table: scoreTable });
  };

  submitScores = () => {
    console.log(this.state.scoreMap)
    const scoreMap = new Map(this.state.scoreMap)
    const scoreKeys = scoreMap.keys()
    console.log(scoreKeys)
    const scoreObject = []
    scoreMap.forEach((value,key) => {
      scoreObject.push(
        {
          criteriaID: key,
          criteriaScore: value
        }
      )
    })
    const body = {
      rubricID: this.state.rubricID,
      measureID: this.state.measureID,
      studentID: this.state.studentID,
      criteriaInfo: scoreObject
    }
    this.props.updateRubricScores(body)
  };


  render() {
    console.log(this.props)
    console.log(this.state)
    let rubrics = [];
    let tests = [];
    if (
      this.props.evaluations.evaluationRubrics !== null &&
      this.props.evaluations.evaluationRubrics !== undefined
    ) {
      if (
        this.props.evaluations.evaluationRubrics.rubrics !== null &&
        this.props.evaluations.evaluationRubrics.rubrics !== undefined
      ) {
        rubrics = this.props.evaluations.evaluationRubrics.rubrics.map(
          (rubric, index) => {
            return (
              <Card key={"rubr" + index}>
                <Card.Header className="rubricTitle" id={"rubric" + index}>
                  <h5 className="mb-0">
                    <button
                      className="btn btn-link"
                      type="button"
                      data-toggle="collapse"
                      data-target={"#rubricCollapse" + index}
                      aria-expanded="true"
                      aria-controls={"rubricCollapse" + index}
                      value={rubric.rubricID}
                      name={rubric.rubricName}
                      onClick={this.rubricHeaderClick.bind(this)}
                    >
                      {rubric.rubricName}
                    </button>
                  </h5>
                </Card.Header>
                <div
                  id={"rubricCollapse" + index}
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
              </Card>
            );
          }
        );
      }

      if (
        this.props.evaluations.evaluationRubrics.tests !== null &&
        this.props.evaluations.evaluationRubrics.tests !== undefined
      ) {
        tests = this.props.evaluations.evaluationRubrics.tests.map(
          (test, index) => {
            return (
              <Card key={"tests" + index}>
                <Card.Header className="rubricTitle" id={"test" + index}>
                  <h5 className="mb-0">
                    <button
                      className="btn btn-link"
                      type="button"
                      data-measure={test.measureID}
                      name={test.testName}
                      value={test.testID}
                      onClick={this.testTitleClick.bind(this)}
                    >
                      {test.testName}
                    </button>
                  </h5>
                </Card.Header>
              </Card>
            );
          }
        );
      }
    }

    // console.log(this.props);

    return (
      <section className="panel important">
        <Card id="rubricStudent">
          <Card.Header>
            <h2><strong>Assigned Tools</strong></h2>
          </Card.Header>

          <Card.Body id="assignedTools" className="row">
          <div className= "col-3">
            <Card>
              <Card.Header className="rubricTitle" id="scoreRubric">
                <h4 className="mb-0">
                  <button
                    className="btn btn-link"
                    type="button"
                    data-toggle="collapse"
                    data-target="#scoreRubricCollapse"
                    aria-expanded="true"
                    aria-controls="scoreRubricCollapse"
                  >
                    Rubrics
                  </button>
                </h4>
              </Card.Header>
              <div
                id="scoreRubricCollapse"
                className="collapse"
                aria-labelledby="headingRubric"
                data-parent="#assignedTools"
              >
                <div className="card-body">
                  <ListGroup>
                    <div className="accordion" id="assignedRubric">
                      {rubrics}
                    </div>
                  </ListGroup>
                </div>
              </div>
            </Card>

            <Card>
              <Card.Header className="rubricTitle" id="scoretest">
                <h4 className="mb-0">
                  <button
                    className="btn btn-link"
                    type="button"
                    data-toggle="collapse"
                    data-target={"#scoretestCollapse"+ this.state.rubricTarget}
                    aria-expanded="true"
                    aria-controls="scoretestCollapse"
                    onClick={()=>this.setState({rubricTarget:""})}
                  >
                    Tests
                  </button>
                </h4>
              </Card.Header>
              <div
                id="scoretestCollapse"
                className="collapse"
                aria-labelledby="headingtest"
                data-parent="#assignedTools"
              >
                <div className="card-body">
                  <ListGroup>
                    <div className="accordion" id="assignedtest">
                      {tests}
                    </div>
                  </ListGroup>
                </div>
              </div>
            </Card>
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
    updateRubricScores,
    testScores,
    updateTestScores
  }
)(Evaluate);
