import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { inviteEvaluator } from "../../actions/evaluatorAction";
import {
  getMeasureDetails,
  getMeasureEvaluators,
  addEvaluator,
  addStudentsToMeasure,
  addStudentToMeasure,
  getStudentsOfMeasure,
  assignStudentsToMeasure,
  getMeasureReport,
} from "../../actions/assessmentCycleAction";
import {getRegisteredEvaluators} from '../../actions/evaluatorAction'
import {
  Jumbotron,
  Card,
  Button,
  Modal,
  Form,
  InputGroup,
  ModalBody
} from "react-bootstrap";
import { isEmpty } from "../../utils/isEmpty";

class MeasureDetails extends Component {
  state = {
    addEval: false,
    addStud: false,
    inviteEval: false,
    email: "",
    errors: {},
    file: "",
    uploadFile: false,
    studAssign: false,
    measureReport: false
  };

  componentDidMount() {
    if (
      !this.props.auth.isAuthenticated &&
      this.props.auth.user.role !== "coordinator"
    ) {
      this.props.history.push("/login");
    }
    const cycleID = this.props.match.params.cycleID;
    const outcomeID = this.props.match.params.outcomeID;
    const measureID = this.props.match.params.measureID;

    this.props.getMeasureDetails(cycleID, outcomeID, measureID);
    this.props.getMeasureEvaluators(measureID);
    this.props.getStudentsOfMeasure(measureID);
    this.props.getMeasureReport(measureID);
    this.props.getRegisteredEvaluators();
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.errors !== nextProps.errors) {
      this.setState({ errors: nextProps.errors });
    }
  }

  addEvalShow = () => {
    this.setState({ addEval: true });
  };

  addEvalHide = () => {
    this.setState({ addEval: false, errors: {} });
  };

  addStudShow = () => {
    this.setState({ addStud: true });
  };

  addStudHide = () => {
    this.setState({ addStud: false });
  };

  inviteEvalShow = () => {
    this.setState({ inviteEval: true });
  };

  inviteEvalHide = () => {
    this.setState({ inviteEval: false, errors: {} });
  };

  addEvaluatorHandler = e => {
    e.preventDefault();
    this.props.addEvaluator(this.props.match.params.measureID, {
      evaluatorEmail: e.target.evalEmail.value
    });
    this.setState({
      email: e.target.evalEmail.value,
      addEval: false,
      inviteEval: true
    });
  };

  inviteEvaluatorHandler = e => {
    e.preventDefault();
    this.props.inviteEvaluator({ evaluatorEmail: this.state.email });
    this.setState({ errors: {}, inviteEval: false });
  };

  fileChangeHandler = e => {
    this.setState({ file: e.target.files[0] });
  };

  uploadStudentsHandler = e => {
    e.preventDefault();
    this.fileUpload(this.state.file);
    this.setState({ uploadFile: false });
  };

  addStudentsHandler = e => {
    e.preventDefault();
    const name = e.target.studName.value;
    const email = e.target.studEmail.value;
    const CWID = e.target.studCWID.value;

    const body = {
      name,
      email,
      CWID
    };
    this.props.addStudentToMeasure(this.props.match.params.measureID, body);
    this.setState({ addStudHide: false });
  };

  fileUpload = file => {
    const formData = new FormData();
    formData.append("file", file);

    const config = {
      headers: {
        "content-type": "multipart/fomr-data"
      }
    };
    this.props.addStudentsToMeasure(
      this.props.match.params.measureID,
      formData,
      config
    );
  };

  uploadFileShow = () => {
    this.setState({ uploadFile: true, addStud: false });
  };

  uploadFileHide = () => {
    this.setState({ uploadFile: false });
  };

  assignStudShow = () => {
    this.setState({ studAssign: true });
  };

  assignStudHide = () => {
    this.setState({ studAssign: false });
  };

  measureReportShow = () => {
    this.setState({ measureReport: true });
  };
  measureReportHide = () => {
    this.setState({ measureReport: false });
  };

  assignStudentsHandle = e => {
    e.preventDefault();
    let studentIDs = [];
    let evalID = e.target.evaluator.value;
    let optionList = e.target.assignedStudents.selectedOptions
    for(let student of optionList){
      studentIDs.push(
        student.value
      )
    }
    let rubricID = this.props.cycles.measureDetails.toolID;
    const body = {
      studentIDs,
      rubricID,
      evalID
    };
    this.props.assignStudentsToMeasure(this.props.match.params.measureID, body);
  };

  render() {
    console.log(this.props);
    let typeRubric = false;
    let measureTitle = null;
    let evaluatorList = [];
    let studentList = [];
    let evaluatorSelect = [];
    let studentSelect = [];
    let measureReport = [];
    let evaluatorOptions = [];

    if (
      this.props.cycles.measureDetails !== null &&
      this.props.cycles.measureDetails !== undefined
    ) {
      if (this.props.cycles.measureDetails.toolType === "rubric") {
        typeRubric = true;
      }

      if (typeRubric) {
        measureTitle = this.props.cycles.measureDetails.measureDescription;
        if (
          this.props.cycles.measureEvaluators !== null &&
          this.props.cycles.measureEvaluators !== undefined
        ) {
          evaluatorList = this.props.cycles.measureEvaluators.evaluators.map(
            evaluator => {
              evaluatorSelect.push(
                <div key={evaluator.measureEvalID}>
                  <input
                    type="radio"
                    name="evaluator"
                    value={evaluator.measureEvalID}
                  />{" "}
                  <label>
                    <h5>{evaluator.name}</h5>
                  </label>
                </div>
              );
              return (
                <li key={evaluator.measureEvalID} className="list-group-item">
                  {evaluator.name} ({evaluator.email})
                </li>
              );
            }
          );
        }
        
        if (
          this.props.cycles.measureStudents !== null &&
          this.props.cycles.measureStudents !== undefined
        ) {
          studentList = this.props.cycles.measureStudents.students.map(student => {
              studentSelect.push(
                <option key={student.studentID} value={student.studentID}>{student.name}</option>
              );
              return (
                <li key={student.studentID} className="list-group-item">
                  <ol>
                    <li>Name: {student.name}</li>{" "}
                    <li>Email: ({student.email})</li>{" "}
                    <li>CWID: {student.CWID}</li>
                  </ol>
                </li>
              );
            }
          );
        }

        if (
          this.props.cycles.measureReport !== null &&
          this.props.cycles.measureReport !== undefined &&
          isEmpty(this.props.cycles.measureReport) === false
        ) {

          const passPoint = this.props.cycles.measureDetails.projectedResult
          const criteriaDesc = this.props.cycles.measureReport.criteriaInfo
          const criterias = []
          const rubricCriterias = () => {
            return criteriaDesc.map((criteria, index) => {
              criterias.push(criteria.criteriaDescription)
              return (
                <th key = {"criteria"+index}>{criteria.criteriaDescription}</th>
              )
            })
          }
          
          const criteriaScores = (details) => {
            return criterias.map(criteria => {
              return (
                <td>{details[criteria]}</td>
              )
            })
          }

          const criteriaAvg = (details) => {
            return criterias.map(criteria => {
              return (
                <td>{details[criteria]}</td>
              )
            })
          }

          measureReport.push(
            <thead>
            <tr>
              <th>Class</th>
              <th>Student</th>
              <th>Evaluator</th>
              {rubricCriterias()}
              <th>Overall Score</th>
              <th>Average Score</th>
            </tr>
            </thead>
          )

          const reportBody = []

          reportBody.push(
            this.props.cycles.measureReport.results.map(student => {
              return(
                <tr>
                  <td>{student.class}</td>
                  <td>{student.studentName}</td>
                  <td>{student.evalName}</td>
                  {criteriaScores(student)}
                  <td>{student.rubricScore}</td>
                  <td>{student.averageScore}</td>
                </tr>
              )
            })
          )
          const avgDetails = this.props.cycles.measureReport.classAverage
          reportBody.push(
            <tr>
              <td colSpan="3">Class avg.</td>
               {criteriaAvg(avgDetails)}
               <td>{avgDetails.averageScore}</td>
               <td>{avgDetails.rubricScore}</td>
            </tr>
          )
          const passingCounts = this.props.cycles.measureReport.passingCounts
          reportBody.push(
              <tr>
                <td colSpan="3">Number >= {passPoint}</td>
                 {criteriaAvg(passingCounts)}
                 <td>{passingCounts.rubricScore}</td>
                 <td>{passingCounts.averageScore}</td>
              </tr>
          )
          reportBody.push(
            <tr>
              <td colSpan="3">Number of Students</td>
               {criterias.map(()=>{
                 return(
                   <td>{this.props.cycles.measureReport.numberOfEvaluations}</td>
                 )
               })}
               <td>{this.props.cycles.measureReport.numberOfEvaluations}</td>
               <td>{this.props.cycles.measureReport.numberOfUniqueStudents}</td>
            </tr>
        )
        const passingPercentages = this.props.cycles.measureReport.passingPercentages
        reportBody.push(
            <tr>
              <td colSpan="3">% >= {passPoint}</td>
               {criteriaAvg(passingPercentages)}
               <td>{passingPercentages.rubricScore}</td>
               <td>{passingPercentages.averageScore}</td>
            </tr>
        )

        measureReport.push(<tbody>
          {reportBody}
        </tbody>)

        measureReport = (<table className="table table-striped">
          {measureReport}
        </table>)
          
      
          


        }
        
        if(this.props.evaluator.evaluators !== null &&
          this.props.evaluator.evaluators !== undefined
         ){
            evaluatorOptions = this.props.evaluator.evaluators.evaluators.map((evaluator,index) => {
             return ( 
             <option key={"eval"+index} value={evaluator.email}/>
             )
            })
          }
      }
    }

    const inviteError =
      "Evaluator Account Does not Exist. Please check the invitee lists or invite the evaluator to create an account";
    const invitedError =
      "Invitation has been sent, but Evaluator has not created the account yet; Please contact the evaluator";

    if (
      this.state.errors === this.props.errors &&
      this.props.errors.evaluatorEmail === invitedError
    ) {
      window.alert(
        "Invitation has been sent, but Evaluator has not created the account yet; Please contact the evaluator"
      );
      this.setState({ errors: {} });
    }

    return (
      <Fragment>
        <section className="panel important">
          <div>
            <div className="row">
              <div className="btn-group btn-breadcrumb">
                <a href="#" className="btn btn-primary brdbtn">
                  Admin
                </a>
                <a href="#" className="btn btn-primary brdbtn ">
                  Cycles
                </a>
                <a href="#" className="btn btn-primary brdbtn">
                  Outcomes
                </a>
                <a href="#" className="btn btn-primary brdbtn">
                  Measures
                </a>
                <a href="#" className="btn btn-primary brdbtn">
                  Measure Detail
                </a>
              </div>
            </div>
          </div>

          <Jumbotron>
            <p id="measure-title-label">Measure Title</p>
            <h4 id="measure-title">{measureTitle}</h4>
            <hr />

            {typeRubric ? (
              <Fragment>
                <Card
                  style={{ width: "30rem", height: "20rem", float: "left" }}
                >
                  <Card.Body>
                    <Card.Title>Evaluators</Card.Title>
                    <ol className="list-group measureCard">{evaluatorList}</ol>
                    <Button
                      variant="primary"
                      className="float-right mt-3"
                      onClick={this.addEvalShow}
                    >
                      Add Evaluators
                    </Button>
                  </Card.Body>
                </Card>

                <Card style={{ width: "30rem", height: "20rem" }}>
                  <Card.Body>
                    <Card.Title>Students</Card.Title>
                    <ol className="list-group measureCard">{studentList}</ol>
                    <Button
                      variant="primary"
                      className="float-right mt-3"
                      onClick={this.addStudShow}
                    >
                      Add Students
                    </Button>
                  </Card.Body>
                </Card>

                <Button className="mt-2" onClick={this.assignStudShow}>
                  Assign Students
                </Button>
                <Button
                  className="mt-2 float-right"
                  onClick={this.measureReportShow}
                >
                  View Report
                </Button>
              </Fragment>
            ) : null}
          </Jumbotron>
        </section>

        <Modal centered show={this.state.addStud} onHide={this.addStudHide}>
          <Modal.Title className="ml-3">Add Student to Measure</Modal.Title>
          <Modal.Body>
            <Form onSubmit={this.addStudentsHandler.bind(this)}>
              <InputGroup>
                <InputGroup.Append>
                  <InputGroup.Text>Name</InputGroup.Text>
                </InputGroup.Append>
                <Form.Control name="studName" placeholder="Name" />
              </InputGroup>
              <InputGroup>
                <InputGroup.Append>
                  <InputGroup.Text>Email</InputGroup.Text>
                </InputGroup.Append>
                <Form.Control
                  type="email"
                  name="studEmail"
                  placeholder="something@example.com"
                />
              </InputGroup>
              <InputGroup>
                <InputGroup.Append>
                  <InputGroup.Text>CWID</InputGroup.Text>
                </InputGroup.Append>
                <Form.Control placeholder="CWID" name="studCWID" />
              </InputGroup>

              <InputGroup className="">
                <div
                  onClick={this.uploadFileShow}
                  id="gotoUpload"
                  className="mb-0 mt-3"
                >
                  Upload a CSV File
                </div>
              </InputGroup>
              <Button
                variant="danger"
                className="mt-3 float-right ml-3"
                onClick={this.addStudHide}
              >
                Close
              </Button>
              <Button
                variant="success"
                className="mt-3 float-right"
                type="submit"
              >
                Add
              </Button>
            </Form>
          </Modal.Body>
        </Modal>

        <Modal
          centered
          show={this.state.uploadFile}
          onHide={this.uploadFileHide}
        >
          <Modal.Title className="ml-3">Upload Students File</Modal.Title>
          <Modal.Body>
            <Form onSubmit={this.uploadStudentsHandler.bind(this)}>
              <InputGroup className="">
                <Form.Control
                  id="studentFile"
                  type="file"
                  name="studentFile"
                  onChange={this.fileChangeHandler.bind(this)}
                />
              </InputGroup>
              <Button
                variant="danger"
                className="mt-3 float-right ml-3"
                onClick={this.uploadFileHide}
              >
                Close
              </Button>
              <Button
                variant="success"
                className="mt-3 float-right"
                type="submit"
              >
                Add
              </Button>
            </Form>
          </Modal.Body>
        </Modal>
        
        {/** Add Evaluator Modal */}
        <Modal show={this.state.addEval} onHide={this.addEvalHide} centered>
          <Modal.Title className="ml-3 mt-2">Add Evaluator</Modal.Title>
          <Modal.Body>
            <Form onSubmit={this.addEvaluatorHandler.bind(this)}>
              <Form.Group controlId="formBasicEmail">
                <Form.Label>Email address</Form.Label>
                <Form.Control
                  type="email"
                  name="evalEmail"
                  placeholder="Enter email"
                  list = "evaluatorList"
                />
                <datalist id="evaluatorList">
                    {evaluatorOptions}
                </datalist>
              </Form.Group>
              <Button
                variant="danger"
                className="mt-3 float-right ml-3"
                onClick={this.addEvalHide}
              >
                Close
              </Button>
              <Button
                variant="success"
                type="submit"
                className="mt-3 float-right"
              >
                Add
              </Button>
            </Form>
          </Modal.Body>
        </Modal>

        <Modal
          show={
            this.props.errors.evaluatorEmail === inviteError &&
            this.state.inviteEval
          }
          centered
        >
          <Modal.Title className="ml-3 mt-2">Invite Evaluator</Modal.Title>
          <Modal.Body>
            <Form onSubmit={this.inviteEvaluatorHandler.bind(this)}>
              <Form.Group controlId="formBasicEmail">
                <Form.Label>Evaluator account doesn't exist!!</Form.Label>
                <Form.Label>
                  Do you want to invite <strong>{this.state.email}</strong> for
                  registration?
                </Form.Label>
                {/*<Form.Text className="text-muted text-danger">
                                        {this.state.errors.evaluatorEmail}
                                    </Form.Text>*/}
              </Form.Group>
              <Button
                variant="danger"
                className="mt-3 float-right"
                onClick={this.inviteEvalHide}
              >
                No
              </Button>
              <Button
                variant="success"
                type="submit"
                className="mt-3 float-right mr-2"
              >
                Invite
              </Button>
            </Form>
          </Modal.Body>
        </Modal>

        <Modal
          show={this.state.studAssign}
          onHide={this.assignStudHide}
          centered
          size="lg"
        >
          <Modal.Title className="ml-3">
            Assign Students to Evaluator
          </Modal.Title>
          <ModalBody>
            <Form
              onSubmit={this.assignStudentsHandle.bind(this)}
              id="studAssign"
            >
              <div
                className="d-inline-block mr-5 border p-3"
                style={{ width: "300px" }}
              >
                <h3>Evaluator List</h3>
                {evaluatorSelect}
              </div>
              <div className="d-inline-block border  p-3">
                <h3>Student List</h3>
                <select name="assignedStudents" multiple>{studentSelect}</select>
              </div>

              <Button type="submit" className="mt-3 d-block">
                Submit{" "}
              </Button>
            </Form>
          </ModalBody>
        </Modal>

        <Modal
          show={this.state.measureReport}
          onHide={this.measureReportHide}
          centered
          size="lg"
        >
          <Modal.Title>Measure Summary</Modal.Title>
          <Modal.Body>{measureReport}</Modal.Body>
          <Button onClick={this.measureReportHide}>Close</Button>
        </Modal>
      </Fragment>
    );
  }
}

MeasureDetails.propTypes = {
  auth: PropTypes.object.isRequired,
  getMeasureDetails: PropTypes.func.isRequired,
  getMeasureEvaluators: PropTypes.func.isRequired,
  addEvaluator: PropTypes.func.isRequired,
  inviteEvaluator: PropTypes.func.isRequired,
  addStudentsToMeasure: PropTypes.func.isRequired,
  getStudentsOfMeasure: PropTypes.func.isRequired,
  addStudentToMeasure: PropTypes.func.isRequired,
  assignStudentsToMeasure: PropTypes.func.isRequired,
  getMeasureReport: PropTypes.func.isRequired,
  getRegisteredEvaluators: PropTypes.func.isRequired
};

const MapStateToProps = state => ({
  auth: state.auth,
  cycles: state.cycles,
  measureDetails: state.measureDetails,
  measureEvaluators: state.measureEvaluators,
  errors: state.errors,
  measureStudents: state.measureStudents,
  assignStudents: state.assugnedStudents,
  evaluator: state.evaluator,
});
export default connect(
  MapStateToProps,
  {
    getMeasureDetails,
    getMeasureEvaluators,
    addEvaluator,
    inviteEvaluator,
    addStudentsToMeasure,
    addStudentToMeasure,
    getStudentsOfMeasure,
    assignStudentsToMeasure,
    getMeasureReport,
    getRegisteredEvaluators
  }
)(MeasureDetails);
