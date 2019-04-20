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
  uploadTestScores,
  getMeasureRubricReport,
  getMeasureTestReport,
  addStudentScore
} from "../../actions/assessmentCycleAction";
import {
  Jumbotron,
  Card,
  Button,
  Modal,
  Form,
  InputGroup,
  ModalBody,
  FormControl,
  ButtonGroup,
  Table
} from "react-bootstrap";
//import { isEmpty } from "../../utils/isEmpty";

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
    uploadTest: false,
    testReport: false
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
    this.props.getRegisteredEvaluators();
  }

  componentDidUpdate(prevProps) {
    const measureID = this.props.match.params.measureID;

    if (!this.props.cycles.cycleLoading) {
      if (
        this.props.cycles.measureDetails !== prevProps.cycles.measureDetails
      ) {
        if (this.props.cycles.measureDetails.toolType === "rubric") {
          this.props.getMeasureRubricReport(measureID);
        }
        if (this.props.cycles.measureDetails.toolType === "test") {
          this.props.getMeasureTestReport(measureID);
        }
      }
    }
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

  testModalShow = () => {
    this.setState({ testModal: true });
  };

  testModalHide = () => {
    this.setState({ testModal: false });
  };

  uploadTestShow = () => {
    this.setState({ uploadTest: true });
  };

  uploadTestHide = () => {
    this.setState({ uploadTest: false });
  };

  testReportShow = () => {
    this.setState({ testReport: true });
  };

  testReportHide = () => {
    this.setState({ testReport: false });
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
    console.log("file changed");
    this.setState({ file: e.target.files[0] });
  };

  uploadStudentsHandler = e => {
    e.preventDefault();
    console.log(e.target);
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
    console.log(body);
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
    console.log(formData);
    this.props.addStudentsToMeasure(
      this.props.match.params.measureID,
      formData,
      config
    );
    //Upload file action here
  };

  uplaodTestScoresHandler = e => {
    e.preventDefault();
    this.testScoresUpload(this.state.file);
    this.setState({ uploadTest: false });
  };

  testScoresUpload = file => {
    const formData = new FormData();
    formData.append("file", file);

    const config = {
      headers: {
        "content-type": "multipart/form-data"
      }
    };
    this.props.uploadTestScores(
      this.props.match.params.measureID,
      formData,
      config
    );
  };

  scoreSingleStudent = e => {
    e.preventDefault();
    const email = e.target.email.value;
    const name = e.target.name.value;
    const score = e.target.score.value;
    const CWID = e.target.CWID.value;

    const body = { name, email, CWID, score };
    this.props.addStudentScore(this.props.match.params.measureID, body);
  };

  assignStudentsHandle = e => {
    e.preventDefault();
    let students = document.getElementsByName("studentCheck");
    let studentIDs = [];
    let evalID = e.target.evaluator.value;
    // console.log(evaluator)
    for (let i = 0; i < students.length; i++) {
      if (students[i].checked) {
        studentIDs.push(students[i].value);
      }
    }
    let rubricID = this.props.cycles.measureDetails.toolID;
    const body = {
      studentIDs,
      rubricID,
      evalID
    };
    console.log(body);
    this.props.assignStudentsToMeasure(this.props.match.params.measureID, body);
  };

  render() {
    console.log(this.props);
    let typeRubric = false;
    let typeTest = false;
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
      } else if (this.props.cycles.measureDetails.toolType === "test") {
        typeTest = true;
      }
      measureTitle = this.props.cycles.measureDetails.measureDescription;
      if (true) {
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
          studentList = this.props.cycles.measureStudents.students.map(
            student => {
              studentSelect.push(
                <div key={student.studentID}>
                  <input
                    type="checkbox"
                    value={student.studentID}
                    name="studentCheck"
                  />
                  <label className="ml-2">
                    <h5>{student.name}</h5>
                  </label>
                </div>
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
          this.props.cycles.measureReport !== undefined
        ) {
          let length = this.props.cycles.measureReport.length;
          const report = this.props.cycles.measureReport;
          measureReport.push(
            <tr>
              <th>Class</th>
              <th>StudentName</th>
              <th>Criteria</th>
              <th>Evaluator</th>
              <th>Criteria Score</th>
            </tr>
          );
          for (let i = 0; i < length; i++) {
            //     for(let j = 0; j < length; j++){
            //    measureReport.push( <tr>
            //         { i===1 ?
            //         <th>Class</th>
            //             : <td>{report[j].class}</td>}
            //         {i === 1 ?
            //         <th>Student</th>
            //             : <td>{report[j].studentName}</td>}
            //         {i === 1 ?
            //         <th>Evaluator</th>
            //         : <td>{report[j].evaluator}</td> }
            //         <th>{report[j].criteriaName}</th>
            //     </tr>
            //    )
            //     }
            measureReport.push(
              <tr>
                <td>{report[i].class}</td>
                <td>{report[i].studentName}</td>
                <td>{report[i].criteriaName}</td>
                <td>{report[i].evaluator}</td>
                <td>{report[i].criteriaScore}</td>
              </tr>
            );
          }
        }
      }

      if (typeTest) {
        if (
          this.props.cycles.measureReport !== null &&
          this.props.cycles.measureReport !== undefined
        ) {
          let header = (
            <thead key={"testHeader"}>
              <tr>
                <th>#</th>
                <th>Student</th>
                <th>Email</th>
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
          measureReport.push(<tbody key="testBody">{body}</tbody>);
          measureReport = (
            <Table striped bordered hover>
              {measureReport}
            </Table>
          );
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
          <div className="container">
            <div className="row">
              <div className="btn-group btn-breadcrumb">
                <li href="#" className="btn btn-primary brdbtn">
                  Admin
                </li>
                <li href="#" className="btn btn-primary brdbtn ">
                  Cycles
                </li>
                <li href="#" className="btn btn-primary brdbtn">
                  Outcomes
                </li>
                <li href="#" className="btn btn-primary brdbtn">
                  Measures
                </li>
                <li className="btn btn-primary brdbtn">Measure Detail</li>
              </div>
            </div>
          </div>

          <Jumbotron>
            <p id="measure-title-label">Measure Title</p>
            <h4 id="measure-title">
              {measureTitle}
              {typeTest ? (
                <button className="float-right" onClick={this.testReportShow}>
                  <i className="fas fa-file-invoice" size="lg" />
                </button>
              ) : null}
              {typeRubric ? (
                <Link
                  to={
                    "/admin/measure/" +
                    this.props.match.params.measureID +
                    "/report"
                  }
                >
                  <button
                    className="float-right"
                    onClick={this.measureReportShow}
                  >
                    <i className="fas fa-file-invoice" size="lg" />
                  </button>
                </Link>
              ) : null}
            </h4>
            <hr />

            <Fragment>
              <Card style={{ width: "30rem", height: "20rem", float: "left" }}>
                <Card.Body>
                  <Card.Header>Evaluators</Card.Header>
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
                  <Card.Header>Students</Card.Header>
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
            </Fragment>

            {typeTest ? (
              <Fragment>
                <ButtonGroup aria-label="Basic example" className="float-right">
                  <Button size="lg" onClick={this.testModalShow}>
                    <i className="fas fa-users" />
                  </Button>
                  <Button size="lg" onClick={this.uploadTestShow}>
                    <i className="fas fa-file-csv" />
                  </Button>
                </ButtonGroup>

                <Modal
                  show={this.state.testModal}
                  onHide={this.testModalHide}
                  centered
                >
                  <Modal.Header closeButton>
                    <h3>Students</h3>
                  </Modal.Header>
                  <Modal.Body className="pt-2 pb-1">
                    <Form onSubmit={this.scoreSingleStudent.bind(this)}>
                      <InputGroup className="row">
                        <InputGroup.Prepend className="col-4">
                          <InputGroup.Text id="basic-addon10">
                            Student Name
                          </InputGroup.Text>
                        </InputGroup.Prepend>
                        <FormControl placeholder="John Doe" name="name" />
                      </InputGroup>
                      <InputGroup className="row mt-1">
                        <InputGroup.Prepend className="col-4">
                          <InputGroup.Text id="basic-addon11">
                            Email (@)
                          </InputGroup.Text>
                        </InputGroup.Prepend>
                        <FormControl
                          type="email"
                          placeholder="example@example.com"
                          name="email"
                        />
                      </InputGroup>
                      <InputGroup className="row mt-1">
                        <InputGroup.Prepend className="col-4">
                          <InputGroup.Text id="basic-addon12">
                            CWID
                          </InputGroup.Text>
                        </InputGroup.Prepend>
                        <FormControl placeholder="12345678" name="CWID" />
                      </InputGroup>
                      <InputGroup className="row mt-1">
                        <InputGroup.Prepend className="col-4">
                          <InputGroup.Text id="basic-addon13">
                            Score
                          </InputGroup.Text>
                        </InputGroup.Prepend>
                        <FormControl placeholder="85" name="score" />
                      </InputGroup>

                      <Button
                        type="submit"
                        className="mt-3 mr-3 mb-3 float-right"
                      >
                        Submit
                      </Button>
                    </Form>
                  </Modal.Body>
                </Modal>

                <Modal
                  show={this.state.uploadTest}
                  onHide={this.uploadTestHide}
                  centered
                >
                  <Modal.Header closeButton>
                    <h3>Upload Test Scores</h3>
                  </Modal.Header>
                  <Modal.Body>
                    <Form onSubmit={this.uplaodTestScoresHandler.bind(this)}>
                      <Form.Control
                        type="file"
                        onChange={this.fileChangeHandler.bind(this)}
                      />
                      <Button className="mt-3 float-right" type="submit">
                        Upload
                      </Button>
                    </Form>
                  </Modal.Body>
                </Modal>

                <Modal
                  show={this.state.testReport}
                  onHide={this.testReportHide}
                  centered
                  size="lg"
                >
                  <Modal.Header closeButton>
                    <h3>Test Summary</h3>
                  </Modal.Header>
                  <Modal.Body>{measureReport}</Modal.Body>
                  <Modal.Footer>
                    <button
                      className="btn btn-danger"
                      onClick={this.testReportHide}
                    >
                      Close
                    </button>
                  </Modal.Footer>
                </Modal>
              </Fragment>
            ) : null}
          </Jumbotron>
        </section>

        <Modal centered show={this.state.addStud} onHide={this.addStudHide}>
          <Modal.Header className="ml-3" closeButton>
            Add Student to Measure
          </Modal.Header>
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
                />
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
                {studentSelect}
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
  getMeasureRubricReport: PropTypes.func.isRequired,
  getRegisteredEvaluators: PropTypes.func.isRequired,
  uploadTestScores: PropTypes.func.isRequired,
  getMeasureTestReport: PropTypes.func.isRequired,
  addStudentScore: PropTypes.func.isRequired
};

const MapStateToProps = state => ({
  auth: state.auth,
  cycles: state.cycles,
  measureDetails: state.measureDetails,
  measureEvaluators: state.measureEvaluators,
  errors: state.errors,
  measureStudents: state.measureStudents,
  assignStudents: state.assugnedStudents
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
    getRegisteredEvaluators,
    uploadTestScores,
    getMeasureRubricReport,
    getMeasureTestReport,
    addStudentScore
  }
)(MeasureDetails);
