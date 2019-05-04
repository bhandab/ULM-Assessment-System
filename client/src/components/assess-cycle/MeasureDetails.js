import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { inviteEvaluator } from "../../actions/evaluatorAction";
import Delete from "../../utils/Delete";

import {
  getMeasureDetails,
  getMeasureEvaluators,
  addEvaluator,
  addStudentsToMeasure,
  addStudentToMeasure,
  getStudentsOfMeasure,
  assignStudentsToMeasure,
  getMeasureRubricReport,
  getMeasureTestReport,
  addStudentScore,
  assignStudentsToTest,
  deleteMeasure,
  updateMeasure,
  deleteEvaluator,
  deleteStudent,
  unassignStudent
} from "../../actions/assessmentCycleAction";
import { getRegisteredEvaluators } from "../../actions/evaluatorAction";
import {getSingleRubric} from '../../actions/rubricsAction';
import { isEmpty } from "../../utils/isEmpty";

import {
  Jumbotron,
  Card,
  Button,
  Modal,
  Form,
  InputGroup,
  ModalBody,
  ProgressBar,
  ListGroup,
  Spinner,
  CardGroup,
  Alert,
  Badge,
  Row,
  Col
} from "react-bootstrap";

import CSVFormat from "../../assets/CSVformat";

class MeasureDetails extends Component {
  state = {
    addEval: false,
    addStud: false,
    inviteEval: false,
    testModal: false,
    email: "",
    errors: {},
    file: "",
    uploadFile: false,
    studAssign: false,
    toolType: "",
    scored: false,
    statusModal: false,
    scoreStudents: false,
    deleteShow: false,
    editShow: false,
    evalStudents: false,
    evalAssgStudents: [],
    notAssgd: false,
    notAssignOption: [],
    isActive: false
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
  }

  componentDidUpdate(prevProps) {
    const measureID = this.props.match.params.measureID;

    if (!this.props.cycles.cycleLoading) {
      if (
        this.props.cycles.measureDetails !== prevProps.cycles.measureDetails
      ) {
        this.setState({ isActive: !this.props.cycles.measureDetails.isClosed });
        if (this.props.cycles.measureDetails.toolType === "rubric") {
          this.props.getMeasureRubricReport(measureID);
          this.props.getSingleRubric(this.props.cycles.measureDetails.toolID)
          this.setState({ toolType: "rubric", scored: true });
        }
        if (this.props.cycles.measureDetails.toolType === "test") {
          this.props.getMeasureTestReport(measureID);
          this.setState({ toolType: "test" });
          if (this.props.cycles.measureDetails.projectedResult !== null) {
            this.setState({ scored: true });
          }
        }
      }
      if (this.props.cycles.measureReport !== prevProps.cycles.measureReport) {
        console.log("Call status changing api here");
      }
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.errors !== nextProps.errors) {
      this.setState({ errors: nextProps.errors });
    }
  }

  deleteMeasureHandler = () => {
    const cycleID = this.props.match.params.cycleID;
    const learnID = this.props.match.params.outcomeID;
    const measureID = this.props.match.params.measureID;

    this.props.deleteMeasure(cycleID, learnID, measureID);
  };

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


  statusModalShow = () => {
    this.setState({ statusModal: true });
  };

  statusModalHide = () => {
    this.setState({ statusModal: false });
  };

  scoreStudentsShow = () => {
    this.setState({ scoreStudents: true });
  };

  scoreStudentsHide = () => {
    this.setState({ scoreStudents: false });
  };

  deleteShow = () => {
    this.setState({ deleteShow: true });
  };

  deleteHide = () => {
    this.setState({ deleteShow: false });
  };

  evalStudentsShow = () => {
    this.setState({ evalStudents: true });
  };

  evalStudentsHide = () => {
    this.setState({ evalStudents: false });
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
    const firstName = e.target.fName.value;
    const lastName = e.target.lName.value;
    const email = e.target.studEmail.value;
    const CWID = e.target.studCWID.value;

    const body = {
      firstName,
      lastName,
      email,
      CWID
    };
    this.props.addStudentToMeasure(this.props.match.params.measureID, body);
    this.setState({ addStud: false });
  };

  fileUpload = file => {
    const formData = new FormData();
    formData.append("file", file);

    const config = {
      headers: {
        "content-type": "multipart/form-data"
      }
    };
    this.props.addStudentsToMeasure(
      this.props.match.params.measureID,
      formData,
      config
    );
  };

  assignStudentsHandle = e => {
    e.preventDefault();
    let data = document.querySelector('input[name = "evaluator"]:checked').dataset

    let body = {};
    let studentIDs = [];
    let evalID = data.evalid;
    let measureEvalID = data.measureevalid;
    let optionList = e.target.assignedStudents.selectedOptions;
    let toolType = this.props.cycles.measureDetails.toolType;
    let measureID = this.props.match.params.measureID;
    let measureEvalEmail = data.email

    for (let student of optionList) {
      studentIDs.push({ id: student.value, email: student.dataset.email });
    }
    let rubricID = this.props.cycles.measureDetails.toolID;
    if (toolType === "rubric") {
      body = {
        evalID,
        studentIDs,
        rubricID,
        measureEvalID
      };
      this.props.assignStudentsToMeasure(measureID, body);
    }
    if (toolType === "test") {
      body = {
        measureEvalID,
        evalID,
        testID: rubricID,
        studentIDs,
        measureEvalEmail
      };
      this.props.assignStudentsToTest(measureID, body);
    }
    this.setState({ studAssign: false });
  };

  updateMeasure = e => {
    e.preventDefault();
    const cycleID = this.props.match.params.cycleID;
    const outcomeID = this.props.match.params.outcomeID;
    const measureID = this.props.match.params.measureID;
    let projectedResult = null;
    const projectedStudentNumber = e.target.pjsn.value;
    if (this.state.scored) {
      projectedResult = e.target.score.value;
    }
    const body = {
      projectedStudentNumber,
      projectedResult
    };
    this.props.updateMeasure(cycleID, outcomeID, measureID, body);
    this.setState({editShow:false})
  };

  deleteEvaluator = e => {
    const measureID = this.props.match.params.measureID;
    const measureEvalID = e.target.value;
    this.props.deleteEvaluator(measureID, measureEvalID);
  };

  deleteStudent = e => {
    const measureID = this.props.match.params.measureID;
    const studentID = e.target.value + "";

    this.props.deleteStudent(measureID, studentID);
  };

  unAssignStudent = e => {
    const measureID = this.props.match.params.measureID;
    const measureEvalID = e.target.name;
    const studentID = e.target.value;
    const body = { measureEvalID, studentID };
    this.props.unassignStudent(measureID, body);
  };

  render() {
    console.log(this.props)
    let typeRubric = false;
    let typeTest = false;
    let measureTitle = null;
    let evaluatorList = [];
    let studentList = [];
    let evaluatorSelect = [];
    let studentSelect = [];
    let notAssignOption = [];
    let evaluatorOptions = [];
    let statusModal = null;
    let status = null;
    let stats = null;
    let scoreModal = null;
    let evalStudents = [];
    let totalStudentNumber = 0;
    let totalAssignedStudents = 0;
    let totalUnassignedStudents = 0;
    let totalEvaluated = 0;
    let totalPassing = 0;
    let totalFailing = 0;
    let spinner = (
      <Fragment>
        <Spinner animation="grow" variant="primary" />
        <Spinner animation="grow" variant="secondary" />
        <Spinner animation="grow" variant="success" />
      </Fragment>
    );
    let studAssignDetail = null;
    let progressBar = spinner;
    let studUnassgDetail = null;
    let rubricScoreOptions = null;

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
      if (
        this.props.cycles.measureEvaluators !== null &&
        this.props.cycles.measureEvaluators !== undefined
      ) {
        let totalEvaluators = this.props.cycles.measureEvaluators.evaluators
          .length;
        if (totalEvaluators > 0) {
          evaluatorList = this.props.cycles.measureEvaluators.evaluators.map(
            evaluator => {
              evaluatorSelect.push(
                <div key={evaluator.measureEvalID}>
                  <input
                    type="radio"
                    name="evaluator"
                    data-measureevalid={evaluator.measureEvalID}
                    data-evalid={evaluator.evalID}
                    data-email = {evaluator.email}
                    onChange={e => notAssignHandler(e)}
                  />{" "}
                  <label>
                    <h5>{evaluator.name}</h5>
                  </label>
                </div>
              );
              return (
                <li key={evaluator.measureEvalID} className="list-group-item">
                  <span
                    id="evalName"
                    data-val={evaluator.measureEvalID}
                    value={evaluator.measureEvalID}
                    onClick={e => evalStudentsHandler(e)}
                  >
                    {evaluator.name}
                  </span>
                  {this.state.isActive ? (
                    <button
                      value={evaluator.measureEvalID}
                      style={{ border: "none", background: "none" }}
                      onClick={this.deleteEvaluator.bind(this)}
                      className="delete float-right"
                    />
                  ) : null}
                  ({evaluator.email})
                </li>
              );
            }
          );
        } else {
          evaluatorList = (
            <ListGroup.Item>
              Click the <i className="fas fa-user">+</i> button to add
              evaluators
            </ListGroup.Item>
          );
        }
      }

      if (
        this.props.cycles.measureStudents !== null &&
        this.props.cycles.measureStudents !== undefined
      ) {
        let totalStudents = this.props.cycles.measureStudents.students.length;

        totalStudentNumber = totalStudents;
        totalUnassignedStudents = this.props.cycles.measureStudents
          .notAssignedStudents.length;

        studUnassgDetail = this.props.cycles.measureStudents.notAssignedStudents.map(
          (student, index) => {
            notAssignOption.push(
              <option
              key={student.studentID}
              data-email={student.email}
              value={student.studentID}
            >
              {student.name}
            </option>
            )
            return (
              <ListGroup.Item key={"notAssgd" + index}>
                {index + 1}. {student.name}
              </ListGroup.Item>
            );
          }
        );

        if (studUnassgDetail.length < 1) {
          studUnassgDetail = (
            <ListGroup.Item>
            <Alert variant="danger">No Students Present</Alert>
            </ListGroup.Item>
          );
        }
        if (totalStudents > 0) {
          studentList = this.props.cycles.measureStudents.students.map(
            student => {
              studentSelect.push(
                <option
                  key={student.studentID}
                  data-email={student.email}
                  value={student.studentID}
                >
                  {student.name}
                </option>
              );
              return (
                <li
                  key={student.studentID}
                  className="list-group-item p-0 pl-2"
                >
                  <ol>
                    <li className="p-0">
                      {student.name}{" "}
                      {this.state.isActive ? (
                        <button
                          value={student.studentID}
                          style={{ border: "none", background: "none" }}
                          onClick={this.deleteStudent.bind(this)}
                          className="delete float-right"
                        />
                      ) : null}
                    </li>
                    <li className="ml-0" style={{fontSize:'.8em'}}>({student.email})</li>
                  </ol>
                </li>
              );
            }
          );
        } else {
          studentList = (
            <ListGroup.Item>
              Click the <i className="fas fa-user-graduate">+</i> button to add
              students
            </ListGroup.Item>
          );
        }

        if (
          this.state.toolType === "rubric" &&
          this.props.cycles.measureDetails.toolType === "rubric"
        ) {
          if (
            this.props.cycles.measureReport !== null &&
            this.props.cycles.measureReport !== undefined &&
            this.props.cycles.measureReport.results !== undefined
          ) {
            totalEvaluated = this.props.cycles.measureReport.results.length;

            let passScore = this.props.cycles.measureReport.threshold;
            let results = this.props.cycles.measureReport.results;
            let passPer = 0;
            if (
              this.props.cycles.measureReport.passingPercentages !== undefined
            ) {
              passPer = this.props.cycles.measureReport.passingPercentages
                .averageScore;
            }
            let evaluated = [];
            let passed = [];
            let failed = [];
            let failPer = 100 - passPer;
            if(this.props.cycles.measureDetails.evalCount > 0){
            if (this.props.cycles.measureDetails.status) {
              status = (
                <>
                  <h3>
                    Status: <span className="text-success">Passing</span>
                  </h3>
                </>
              );
            } else {
              status = (
                <h3>
                  Status: <span className="text-danger">Failing</span>
                </h3>
              );
            }
          }
          else{
            status = (
              <h3>
                Status: <span className="text-warning">Pending</span>
              </h3>
            );

          }

          if(this.props.cycles.measureDetails.evalCount > 0) {
            progressBar = (
              <ProgressBar style={{height:'25px'}}>
                <ProgressBar 
                  variant="success"
                  now={passPer}
                  label={`Passing(${passPer}%)`}
                  key={1}
                />
                <ProgressBar 
                  variant="danger"
                  now={failPer}
                  label={`Failing(${failPer}%)`}
                  key={2}
                />
              </ProgressBar>
            );
          }
          else {
           progressBar = <ProgressBar 
                  variant="warning"
                  now={100}
                  label={`pending`}
                  key={4}
                />
          }
            evaluated = results.map((student, index) => {
              if (student.averageScore >= passScore) {
                passed.push(
                  <ListGroup.Item key={"pass" + index} className="statStuds">
                    {student.studentName}
                  </ListGroup.Item>
                );
              } else {
                failed.push(
                  <ListGroup.Item key={"fail" + index} className="statStuds">
                    {student.studentName}
                  </ListGroup.Item>
                );
              }
              return (
                <ListGroup.Item key={"eval" + index} className="statStuds">
                  {student.studentName}
                </ListGroup.Item>
              );
            });
            statusModal = (
              <Modal
                show={this.state.statusModal}
                onHide={this.statusModalHide}
                size="lg"
                centered
              >
                <Modal.Header closeButton>
                  <h3 className="text-secondary">
                    Student Status
                    <br />
                    <small className="text-info">
                      Total:{this.props.cycles.measureStudents.students.length}
                    </small>
                  </h3>
                </Modal.Header>
                <Modal.Body className="row">
                  <Card style={{ width: "15em" }} className="col-4 statCard">
                    <Card.Header>
                      <h4 className="text-info">Evaluated</h4>
                      <h6 className="text-info">Count:{evaluated.length}</h6>
                    </Card.Header>
                    <Card.Body>
                      <ListGroup>{evaluated}</ListGroup>
                    </Card.Body>
                  </Card>
                  <Card style={{ width: "15em" }} className="col-4 statCard">
                    <Card.Header>
                      <h4 className="text-success">Passing</h4>
                      <h6 className="text-info">Count:{passed.length}</h6>
                    </Card.Header>
                    <Card.Body>
                      <ListGroup>{passed}</ListGroup>
                    </Card.Body>
                  </Card>
                  <Card style={{ width: "15em" }} className="col-4 statCard">
                    <Card.Header>
                      <h4 className="text-danger">Failing</h4>
                      <h6 className="text-info">Count:{failed.length}</h6>
                    </Card.Header>
                    <Card.Body>
                      <ListGroup>{failed}</ListGroup>
                    </Card.Body>
                  </Card>
                </Modal.Body>
                <Modal.Footer>
                  <Button variant="danger" onClick={this.statusModalHide}>
                    Close
                  </Button>
                </Modal.Footer>
              </Modal>
            );
            totalPassing = passed.length;
            totalFailing = failed.length;
          }
        }


        if (
          this.props.evaluator.evaluators !== null &&
          this.props.evaluator.evaluators !== undefined
        ) {
          evaluatorOptions = this.props.evaluator.evaluators.evaluators.map(
            (evaluator, index) => {
              return <option key={"eval" + index} value={evaluator.email} />;
            }
          );
        }

        if (typeTest) {
          if (
            this.props.cycles.measureReport !== null &&
            this.props.cycles.measureReport !== undefined &&
            this.props.cycles.measureReport.report !== null &&
            this.props.cycles.measureReport.report !== undefined
          ) {
            let passPer = this.props.cycles.measureReport.passingPercentage;
            let failPer = 100 - passPer;

              if(this.props.cycles.measureDetails.evalCount > 0){
            if (this.props.cycles.measureDetails.status) {
              status = (
                <h3>
                  Status: <span className="text-success">Passing</span>
                </h3>
              );
            } else {
              status = (
                <h3>
                  Status: <span className="text-danger">Failing</span>
                </h3>
              );
            }
          }
          else{
            status = (
              <h3>
                Status: <span className="text-warning">Pending</span>
              </h3>
            );
          }

          if(this.props.cycles.measureDetails.evalCount > 0){
            progressBar = (
              <ProgressBar style={{height:'20px'}}>
                <ProgressBar
                  now={passPer}
                  variant="success"
                  label={`${passPer}%`}
                />
                <ProgressBar
                  now={failPer}
                  variant="danger"
                  label={`${failPer}%`}
                />
              </ProgressBar>
            );
          }
          else {
            progressBar =   <ProgressBar
            now={100}
            variant="warning"
            label={`${"pending"}`}
          />
          }

            let evaluated = [];
            let passed = [];
            let failed = [];
            let passScore = "";
            let testType = "";
            if (this.props.cycles.measureDetails.projectedResult !== null) {
              testType = "scored";
              passScore = this.props.cycles.measureDetails.projectedResult;
            } else {
              testType = "pass";
            }

            let results = this.props.cycles.measureReport.report;
            evaluated = results.map((student, index) => {
              if (testType === "scored") {
                if (student.score >= passScore) {
                  passed.push(
                    <ListGroup.Item key={"pass" + index} className="statStuds">
                      {student.studentName}
                    </ListGroup.Item>
                  );
                } else {
                  failed.push(
                    <ListGroup.Item key={"fail" + index} className="statStuds">
                      {student.studentName}
                    </ListGroup.Item>
                  );
                }
              } else {
                if (student.passing) {
                  passed.push(
                    <ListGroup.Item key={"pass" + index} className="statStuds">
                      {student.studentName}
                    </ListGroup.Item>
                  );
                } else {
                  failed.push(
                    <ListGroup.Item key={"fail" + index} className="statStuds">
                      {student.studentName}
                    </ListGroup.Item>
                  );
                }
              }
              return (
                <ListGroup.Item key={"eval" + index} className="statStuds">
                  {student.studentName}
                </ListGroup.Item>
              );
            });

            totalEvaluated = evaluated.length;
            totalPassing = passed.length;
            totalFailing = failed.length;

            statusModal = (
              <Modal
                show={this.state.statusModal}
                onHide={this.statusModalHide}
                size="lg"
                centered
              >
                <Modal.Header closeButton>
                  <h3 className="text-secondary">
                    Student Status
                    <br />
                    <small className="text-info">
                      Total:{this.props.cycles.measureStudents.students.length}
                    </small>
                  </h3>
                </Modal.Header>
                <Modal.Body className="row">
                  <Card style={{ width: "15em" }} className="col-4 statCard">
                    <Card.Header>
                      <h4 className="text-info">Evaluated</h4>
                      <h6 className="text-info">Count:{evaluated.length}</h6>
                    </Card.Header>
                    <Card.Body>
                      <ListGroup>{evaluated}</ListGroup>
                    </Card.Body>
                  </Card>
                  <Card style={{ width: "15em" }} className="col-4 statCard">
                    <Card.Header>
                      <h4 className="text-success">Passing</h4>
                      <h6 className="text-info">Count: {passed.length}</h6>
                    </Card.Header>
                    <Card.Body>
                      <ListGroup>{passed}</ListGroup>
                    </Card.Body>
                  </Card>
                  <Card style={{ width: "15em" }} className="col-4 statCard">
                    <Card.Header>
                      <h4 className="text-danger">Failing</h4>
                      <h6 className="text-info">Count: {failed.length}</h6>
                    </Card.Header>
                    <Card.Body>
                      <ListGroup>{failed}</ListGroup>
                    </Card.Body>
                  </Card>
                </Modal.Body>
                <Modal.Footer>
                  <Button variant="danger" onClick={this.statusModalHide}>
                    Close
                  </Button>
                </Modal.Footer>
              </Modal>
            );
          }

        }
      }

      if(!this.props.rubric.loading){
        if (isEmpty(this.props.rubric.singleRubric) === false) {
          rubricScoreOptions = this.props.rubric.singleRubric.rubricDetails.scaleInfo.map(
            scale => {
              return (
                <option key={"scale" + scale.scaleID} value={scale.scaleValue}>
                  {scale.scaleDescription}
                </option>
              );
            }
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

    const evalStudentsHandler = e => {
      const assignedStuds = this.props.cycles.assignedStudents.assignedStudentsList.concat(
        this.props.cycles.assignedStudents.evaluatedStudentsList
      );
      const evalID = e.target.dataset.val;
      assignedStuds.forEach((student, index) => {
        if (student.measureEvalID + "" === evalID) {
          evalStudents.push(
            <ListGroup.Item key={"evlStd" + index}>
              {student.name}
            </ListGroup.Item>
          );
        }
      });
      this.setState({ evalAssgStudents: evalStudents, evalStudents: true });
    };

    const notAssignHandler = e => {
      const assignedStuds = this.props.cycles.assignedStudents.assignedStudentsList.concat(
        this.props.cycles.assignedStudents.evaluatedStudentsList.concat
      );
      const evalID = e.target.dataset.measureevalid;
      assignedStuds.forEach((student, index) => {
        if (student.measureEvalID + "" !== evalID) {
          notAssignOption.push(
            <option key={"notAssgd" + index} value={student.studentID}>
              {student.name}
            </option>
          );
        }
      });
    };

    if (this.props.cycles.assignedStudents !== null) {
      studAssignDetail = null;
      const assignedStuds = this.props.cycles.assignedStudents.assignedStudentsList
      totalAssignedStudents = assignedStuds.length
      studAssignDetail = assignedStuds.map((student,index) => {
        return (
          <ListGroup.Item key={"seval" + student.studentID+""+index}>
             <span className="statStud">{index+1}. {student.name}</span>
            <Badge pill> assigned to </Badge>{" "}
            <span className="statEval">{student.evalEmail}</span>
            <button
              style={{ border: "none", background: "none" }}
              name={student.measureEvalID}
              value={student.studentID}
              onClick={this.unAssignStudent.bind(this)}
              className="delete float-right"
            />
          </ListGroup.Item>
        );
      });

      if (studAssignDetail.length < 1) {
        studAssignDetail = (
          <ListGroup.Item>
            <Alert variant="danger">No Students Present!</Alert>
          </ListGroup.Item>
        );
      }
    }

    return (
      <Fragment>
        <section  className="panel important">

<ul className="ml-2 mb-0" id="breadcrumb">
  <li className="ml-0"><Link to="/admin/dashboard"><span><i className="fas fa-home mr-1"></i></span>Dashboard </Link></li>
  <li><Link to="/admin/cycles"><span> <i className="fas mr-1 fa-recycle"></i></span>Cycles</Link></li>
  <li><Link to={`/admin/cycles/cycle/${this.props.match.params.cycleID}`}><span><i className="far fa-list-alt"></i></span> Outcomes</Link></li>
  <li><Link to={{pathname:`/admin/cycles/cycle/${this.props.match.params.cycleID}/outcomes/${this.props.match.params.outcomeID}`,hash:window.location.hash}}><span><i className="fas fa-percentage"></i></span> Measures</Link></li>
  <li ><Link to={{pathname:`/admin/cycles/cycle/${this.props.match.params.cycleID}/outcomes/${this.props.match.params.outcomeID}/measures/${this.props.match.params.measureID}`,hash:window.location.hash}}><span><i className="fas fa-chart-bar"></i></span> Measure Details</Link></li>
</ul>

          <Jumbotron className="noprint m-2">
            <p id="measure-title-label">Measure Title</p>
            <h4 id="measure-title">
              {measureTitle}
              {typeTest ? (
                <Link
                  to={
                    "/admin/measure/" +
                    this.props.match.params.measureID +
                    "/testReport"
                  }
                >
                  <button
                    type="button"
                    data-toggle="tooltip"
                    data-placement="right"
                    title="View Measure Report"
                    className="float-right ml-5"
                  >
                    <i className="fas fa-file-invoice" size="lg" />
                  </button>
                </Link>
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
                    type="button"
                    data-toggle="tooltip"
                    data-placement="right"
                    data-html="true"
                    title="View Measure Report"
                    className="ml-5 float-right"
                    onClick={this.measureReportShow}
                  >
                    <i className="fas fa-file-invoice" size="lg" />
                  </button>
                </Link>
              ) : null}
              {this.state.isActive ? (
                <>
                  <button
                    style={{ border: "none", background: "none" }}
                    onClick={() => this.setState({ editShow: true })}
                    className="outcome-edit ml-2"
                  />
                  <button
                    style={{ border: "none", background: "none" }}
                    name={this.props.match.params.measureID}
                    onClick={this.deleteShow.bind(this)}
                    className="delete"
                  />
                </>
              ) : null}
             
            </h4>
            {this.state.editShow ? (
              <Form className="ml-2" onSubmit={this.updateMeasure.bind(this)}>
                <InputGroup className="row">
                  <InputGroup className="col-5">
                    <InputGroup.Prepend>
                      <InputGroup.Text>
                        Projected Student Number
                      </InputGroup.Text>
                    </InputGroup.Prepend>
                    <Form.Control
                      type="number"
                      name="pjsn"
                      placeholder="% of passing Students"
                      required
                      defaultValue={this.props.cycles.measureDetails.projectedStudentNumber}
                    />
                  </InputGroup>
                  {this.state.scored && this.state.toolType === "test"? (
                    <InputGroup className="col-5">
                      <InputGroup.Prepend>
                        <InputGroup.Text>Projected Result</InputGroup.Text>
                      </InputGroup.Prepend>
                      <Form.Control
                        type="number"
                        name="score"
                        placeholder="passing score"
                        defaultValue={this.props.cycles.measureDetails.projectedResult}
                        required
                      />
                    </InputGroup>
                  ) : null}
                   {this.state.scored && this.state.toolType === "rubric"? (
                    <InputGroup className="col-5">
                      <InputGroup.Prepend>
                        <InputGroup.Text>Projected Result</InputGroup.Text>
                      </InputGroup.Prepend>
                      <select name="score">
                        {rubricScoreOptions}
                      </select>
                      
                    </InputGroup>
                  ) : null}
                </InputGroup>
                <Button
                  type="submit"
                  variant="success"
                  className="mt-2 ml-3"
                >
                  <i className="fas fa-check text-light" />
                </Button>
                <Button
                  variant="danger"
                  className="mt-2"
                  onClick={() => this.setState({ editShow: false })}
                >
                  <i className="fas fa-times text-light" />
                </Button>
              </Form>
            ) : null}

            <hr />
            <div className="ml-0  mb-2 pl-2 pr-2 pb-2">
              <Button
                variant="outline-info"
                className="mt-1 mb-1"
                onClick={this.statusModalShow}
              >
                {status}
              </Button>
              <Badge pill variant="warning" className=" ml-3 p-1 text-dark">
                Click on 'Status' to see details
              </Badge>
              {progressBar}
              {statusModal}
              {stats}
            </div>

            <Fragment>
              <CardGroup>
                <Card>
                  <Card.Header>
                    <h3>
                      Evaluators
                      <Badge
                        pill
                        variant="warning"
                        style={{ fontSize: ".5em" }}
                        className=" ml-4 p-1"
                      >
                        Click on name to see students
                      </Badge>
                      {this.state.isActive ? (
                        <Button
                          data-toggle="tooltip"
                          data-placement="right"
                          title="Add Evaluators To Measure"
                          variant="primary"
                          className="float-right"
                          onClick={this.addEvalShow}
                        >
                          <i className="fas fa-user-plus" />
                        </Button>
                      ) : null}
                    </h3>
                  </Card.Header>
                  <Card.Body className="mb-1 pt-1">
                    <ListGroup className="measureCard">{evaluatorList}</ListGroup>
                    {this.state.isActive ? (
                      <Button
                        className="mt-2"
                        onClick={this.assignStudShow}
                        size="sm"
                      >
                        Assign Students
                      </Button>
                    ) : null}
                  </Card.Body>
                </Card>

                <Card>
                  <Card.Header>
                    <h3>
                      Students
                      {this.state.isActive ? (
                        <Button
                          data-toggle="tooltip"
                          data-placement="right"
                          title="Add Students To Measure"
                          variant="primary"
                          className="float-right"
                          onClick={this.addStudShow}
                        >
                          <i className="fas fa-user-graduate">+</i>
                        </Button>
                      ) : null}
                    </h3>
                  </Card.Header>
                  <Card.Body className="mb-1 pt-1">
                    <ListGroup className="measureCard">{studentList}
                    </ListGroup>
                  </Card.Body>
                </Card>
              </CardGroup>
              <Card className="mt-3">
                <Card.Header style={{ textAlign: "center" }}>
                  <h4>Measure Statistics</h4>
                </Card.Header>
                <Card.Body style={{ fontSize: "1.4em" }}>
                  <Row>
                    <Col>
                      <Badge variant="light">
                        Total Students: {totalStudentNumber}
                      </Badge>
                    </Col>
                    <Col>
                      <Badge variant="light">
                        Total Assignments: {totalAssignedStudents}
                      </Badge>
                    </Col>
                    <Col>
                      <Badge variant="light">
                        Total Not Assigned: {totalUnassignedStudents}
                      </Badge>
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <Badge variant="light">
                        Total Evaluated: {totalEvaluated}
                      </Badge>
                    </Col>
                    <Col>
                      <Badge variant="light">
                        Passing Meaure Count: {totalPassing}
                      </Badge>
                    </Col>
                    <Col>
                      <Badge variant="light">
                        Failing Measure Count: {totalFailing}
                      </Badge>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              <Card.Header className="mt-3 text-center">
                <h4>Student Assignment Information</h4>
              </Card.Header>

              <CardGroup id="assignInfoCard">
                <Card className="assignmentStats">
                  <Card.Header>Not Evaluated Students</Card.Header>
                  <Card.Body>
                    <ListGroup>{studAssignDetail}</ListGroup>
                  </Card.Body>
                </Card>

                <Card className="unAssgStats">
                  <Card.Header>Not Assigned Students</Card.Header>
                  <Card.Body>
                    <ListGroup>{studUnassgDetail}</ListGroup>
                  </Card.Body>
                </Card>
              </CardGroup>
            </Fragment>
          </Jumbotron>
        </section>

        <Modal
          centered
          show={this.state.addStud}
          onHide={this.addStudHide}
          size="lg"
        >
          <Modal.Header style={{ background: "rgba(0,0,0,0.03)" }} closeButton>
            <h3 style={{ color: "#600" }}>Add Student to Measure</h3>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={this.addStudentsHandler.bind(this)}>
              <InputGroup>
                <InputGroup.Append>
                  <InputGroup.Text>
                    <strong>First Name</strong>
                  </InputGroup.Text>
                </InputGroup.Append>
                <Form.Control name="fName" placeholder="eg. John" required />
                <InputGroup.Append>
                  <InputGroup.Text>
                    <strong>Last Name</strong>
                  </InputGroup.Text>
                </InputGroup.Append>
                <Form.Control name="lName" placeholder="eg. Doe" required />
              </InputGroup>
              <InputGroup className="mt-2">
                <InputGroup.Append>
                  <InputGroup.Text>
                    <strong>Email</strong>
                  </InputGroup.Text>
                </InputGroup.Append>
                <Form.Control
                  type="email"
                  name="studEmail"
                  placeholder="something@example.com"
                  required
                />
              </InputGroup>
              <InputGroup className="mt-2">
                <InputGroup.Append>
                  <InputGroup.Text>
                    <strong>CWID</strong>
                  </InputGroup.Text>
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
          <Modal.Header className="ml-3" closeButton>
            <h3>Upload Students File</h3>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={this.uploadStudentsHandler.bind(this)}>
              <InputGroup className="">
                <Form.Control
                  id="studentFile"
                  type="file"
                  name="studentFile"
                  onChange={this.fileChangeHandler.bind(this)}
                  required
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
            <CSVFormat className="mt-3" />
          </Modal.Body>
        </Modal>

        {/** Add Evaluator Modal */}

        <Modal show={this.state.addEval} onHide={this.addEvalHide} centered>
          <Card id="addEval">
            <Card.Header style={{ color: "#600", textAlign: "center" }}>
              <h3>Add Evaluator</h3>
            </Card.Header>

            <Modal.Body>
              <Form onSubmit={this.addEvaluatorHandler.bind(this)}>
                <Form.Group controlId="formBasicEmail">
                  <Form.Label className="mb-0">
                    {" "}
                    <h4>Email address</h4>{" "}
                  </Form.Label>
                  <Form.Control
                    type="email"
                    name="evalEmail"
                    placeholder="Enter email"
                    list="evaluatorList"
                  />
                  <datalist id="evaluatorList">{evaluatorOptions}</datalist>
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
          </Card>
        </Modal>

        <Modal
          show={
            this.props.errors.evaluatorEmail === inviteError &&
            this.state.inviteEval
          }
          centered
          id="addStudent"
        >
          <Modal.Title className="ml-0 mt-2">Invite Evaluator</Modal.Title>
          <Modal.Body>
            <Form onSubmit={this.inviteEvaluatorHandler.bind(this)}>
              <Form.Group controlId="formBasicEmail">
                <Form.Label>Evaluator account doesn't exist!!</Form.Label>
                <Form.Label>
                  Do you want to invite <strong>{this.state.email}</strong> for
                  registration?
                </Form.Label>
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
          <Modal.Header className="" id="assgStudToEval" closeButton>
            <h4>Assign Students to Evaluator</h4>
          </Modal.Header>
          <ModalBody>
            <Form
              onSubmit={this.assignStudentsHandle.bind(this)}
              id="studAssign"
            >
              <CardGroup>
                <Card>
                  <Card.Header>
                    <h3>Evaluator List</h3>
                  </Card.Header>
                  <Card.Body>
                    <div id="evalSelect">{evaluatorSelect}</div>
                  </Card.Body>
                </Card>
                <Card>
                  <Card.Header>
                    <h3>
                      Student List
                      <i
                        data-toggle="tooltip"
                        data-placement="right"
                        title="Ctrl+A to select all 
                      Ctrl + click  or Click and Drag to select multiple."
                        variant="primary"
                        className="fas fa-info-circle text-info float-right"
                      />
                    </h3>
                  </Card.Header>
                  <Card.Body className="m-0 p-2">
                       <select
                          id="studSelect"
                          name="assignedStudents"
                          multiple
                        >
                          {studentSelect}
                        </select>
                  </Card.Body>
                </Card>
              </CardGroup>
              <Button type="submit" className="mt-3 d-block float-right">
                Assign{" "}
              </Button>
            </Form>
          </ModalBody>
        </Modal>
        {/* Evaluator Students */}
        <Modal
          show={this.state.evalStudents}
          onHide={this.evalStudentsHide}
          centered
        >
          <Modal.Header closeButton>
            <h3>Assigned Students</h3>
          </Modal.Header>
          <Modal.Body>
            <ListGroup>{this.state.evalAssgStudents}</ListGroup>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="danger" className="float-right">
              Close
            </Button>
          </Modal.Footer>
        </Modal>
        {scoreModal}
        <Delete
          hide={this.deleteHide}
          show={this.state.deleteShow}
          value="Performance Measure"
          name={measureTitle}
          delete={this.deleteMeasureHandler}
        />
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
  assignStudents: state.assugnedStudents,
  evaluator: state.evaluator,
  evaluations: state.eveluations,
  rubric: state.rubric
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
    getMeasureRubricReport,
    getMeasureTestReport,
    addStudentScore,
    assignStudentsToTest,
    deleteMeasure,
    updateMeasure,
    deleteEvaluator,
    deleteStudent,
    unassignStudent,
    getSingleRubric
  }
)(MeasureDetails);