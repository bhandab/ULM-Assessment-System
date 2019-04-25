import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import {Link} from 'react-router-dom';
import { inviteEvaluator } from "../../actions/evaluatorAction";
import { isEmpty } from '../../utils/isEmpty'
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
import { getRegisteredEvaluators } from "../../actions/evaluatorAction";
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
  Table,
  ProgressBar,
  ListGroup,
  Spinner
} from "react-bootstrap";

import CSVFormat from '../../assets/CSVformat'

class MeasureDetails extends Component {
  state = {
    addEval: false,
    addStud: false,
    inviteEval: false,
    testModal:false,
    email: "",
    errors: {},
    file: "",
    uploadFile: false,
    studAssign: false,
    uploadTest:false,
    testReport:false,
    toolType:"",
    statusModal: false,
    stats:false
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
    // this.props.getMeasureEvaluators(measureID);
    // this.props.getStudentsOfMeasure(measureID);
    // this.props.getRegisteredEvaluators();
  }

  componentDidUpdate(prevProps){
    const measureID = this.props.match.params.measureID;

    if(!this.props.cycles.cycleLoading){
      if(this.props.cycles.measureDetails !== prevProps.cycles.measureDetails){
        if(this.props.cycles.measureDetails.toolType === 'rubric' ){
          this.props.getMeasureRubricReport(measureID);
          this.setState({toolType:"rubric"})
        }
        if(this.props.cycles.measureDetails.toolType === 'test' ){
          this.props.getMeasureTestReport(measureID);
          this.setState({toolType:"test"})
        }
      }
      if(this.props.cycles.measureReport !== prevProps.cycles.measureReport){
        console.log("Call status changing api here")
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
    this.setState({testModal:true})
  }

  testModalHide = () => {
    this.setState({testModal:false})
  }

  uploadTestShow = () =>{
    this.setState({uploadTest:true})
  }

  uploadTestHide = () => {
    this.setState({uploadTest:false})
  }

  testReportShow = () => {
    this.setState({testReport:true})
  }

  testReportHide = () => {
    this.setState({testReport:false})
  }

  statusModalShow = () => {
    this.setState({statusModal:true})
  }

  statusModalHide = () => {
    this.setState({statusModal:false})
  }

  statsShow = () => {
    this.setState({stats:true})
  }

  statsHide = () => {
    this.setState({stats:false})
  }

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
    this.setState({file: e.target.files[0]});
  };

  uploadStudentsHandler = e => {
    e.preventDefault();
    this.fileUpload(this.state.file);
    this.setState({ uploadFile: false });
  };

  addStudentsHandler = e => {
    e.preventDefault();
    const firstName = e.target.fName.value;
    const lastName = e.target.lName.value
    const email = e.target.studEmail.value;
    const CWID = e.target.studCWID.value;

    const body = {
      firstName,
      lastName,
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
        "content-type": "multipart/form-data"
      }
    };
    this.props.addStudentsToMeasure(
      this.props.match.params.measureID,
      formData,
      config
    );
  };

  uplaodTestScoresHandler = (e) => {
    e.preventDefault()
    this.testScoresUpload(this.state.file);
    this.setState({ uploadTest: false });

  }

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
    e.preventDefault()
    const email= e.target.email.value
    const firstName = e.target.fName.value
    const lastName = e.target.lName.value
    const score = e.target.score.value
    const CWID = e.target.CWID.value

    const body = {firstName,lastName,email,CWID,score}
    this.props.addStudentScore(this.props.match.params.measureID,body)
  }

  assignStudentsHandle = e => {
    e.preventDefault();
    let studentIDs = [];
    let evalID = e.target.evaluator.value;
    let optionList = e.target.assignedStudents.selectedOptions;
    for (let student of optionList) {
      studentIDs.push(student.value);
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
    let typeTest = false;
    let measureTitle = null;
    let evaluatorList = [];
    let studentList = [];
    let evaluatorSelect = [];
    let studentSelect = [];
    let measureReport = [];
    let evaluatorOptions = [];
    let progressBar = ( < Fragment>
                          <Spinner animation="grow" variant="primary" />
                          <Spinner animation="grow" variant="secondary" />
                          <Spinner animation="grow" variant="success" />
                          </Fragment>
  )
    let statusModal= null;
    let status = null;
    let statusBtn = null;
    let stats = null;

    if (
      this.props.cycles.measureDetails !== null &&
      this.props.cycles.measureDetails !== undefined
    ) {
      if (this.props.cycles.measureDetails.toolType === "rubric") {
        typeRubric = true;
      }
      else if(this.props.cycles.measureDetails.toolType === "test"){
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
          let totalStudents = this.props.cycles.measureStudents.students.length
          
          studentList = this.props.cycles.measureStudents.students.map(
            student => {
              studentSelect.push(
                <option key={student.studentID} value={student.studentID}>
                  {student.name}
                </option>
              );
              return (
                <li key={student.studentID} className="list-group-item p-0 pl-2">
                  <ol>
                    <li className="p-0">{student.name}</li>{" "}
                    {/* <li>Email: ({student.email})</li>{" "}
                    <li>CWID: {student.CWID}</li> */}
                  </ol>
                </li>
              );
            }
          );

          if(this.state.toolType === "rubric"){
              if(this.props.cycles.measureReport !== null &&
                this.props.cycles.measureReport !== undefined){
                  
                  let passScore = this.props.cycles.measureReport.threshold
                  let benchmarkPer = this.props.cycles.measureDetails.projectedStudentNumber
                  let passingCount = this.props.cycles.measureReport.passingCounts.averageScore
                  let results = this.props.cycles.measureReport.results
                  
                  let passPer = this.props.cycles.measureReport.passingPercentages.averageScore //((passingCount/totalStudents)*100).toFixed(2)
                  let evaluated = []
                  let passed = []
                  let failed = []
                  // let notAssigned = totalStudents - results.length
                  // let notAssgPer = ((notAssigned / totalStudents) * 100).toFixed(2)
                  let failPer = 100 - passPer
                  // if(isEmpty(passingCount)){
                  //  failPer = 100
                  //  notAssgPer = 0
                  //  passPer = 0
                  // }
                  if(passPer > benchmarkPer){
                    status = (<h3>Status: <span className="text-success">Passing</span></h3>)
                  }
                  else{
                    status = (<h3>Status: <span className="text-danger">Failing</span></h3>)
                  }
                  statusBtn = <Button variant="outline-info" 
                  className="float-right mt-2 mb-2"
                  onClick={this.statsShow}>
                  <i className="fas fa-ellipsis-v"></i>
                  </Button>

                  progressBar = (
                    <ProgressBar>
                        <ProgressBar variant="success" now={passPer} label={`Passing(${passPer}%)`}  key={1} />
                        <ProgressBar variant="danger" now={failPer} label={`Failing(${failPer}%)`}  key={2} />
                        {/* <ProgressBar variant="warning" now={notAssgPer} label={`NA(${notAssgPer}%)`} key={3} /> */}
                    </ProgressBar>
                  )
                    evaluated = results.map((student,index) => {
                      if(student.averageScore >= passScore){
                        passed.push(
                        <ListGroup.Item key={"pass"+index} className="statStuds">{student.studentName}</ListGroup.Item>
                        )
                      }
                      else{
                        failed.push(
                          <ListGroup.Item key = {"fail"+index} className="statStuds">{student.studentName}</ListGroup.Item>
                        )
                      }
                      return (
                        <ListGroup.Item key={"eval"+index} className="statStuds">{student.studentName}</ListGroup.Item>
                      )
                        
                    })
                    statusModal = (
                      <Modal show={this.state.statusModal} onHide={this.statusModalHide} size="lg" centered>
                        <Modal.Header closeButton><h3 className="text-secondary">Student Status</h3></Modal.Header>
                        <Modal.Body className="row">
                          <Card style={{width:'15em'}} className="col-4 statCard">
                            <Card.Header><h4 className="text-info">Evaluated</h4></Card.Header>
                            <Card.Body>
                              <ListGroup>
                                {evaluated}
                              </ListGroup>
                            </Card.Body>
                          </Card>
                          <Card style={{width:'15em'}} className="col-4 statCard">
                            <Card.Header><h4 className="text-success">Passing</h4></Card.Header>
                            <Card.Body>
                              <ListGroup>
                                {passed}
                              </ListGroup>
                            </Card.Body>
                          </Card>
                          <Card style={{width:'15em'}} className="col-4 statCard">
                            <Card.Header><h4 className="text-danger">Failing</h4></Card.Header>
                            <Card.Body>
                              <ListGroup>
                                {failed}
                              </ListGroup>
                            </Card.Body>
                          </Card>
                        </Modal.Body>
                        <Modal.Footer>
                          <Button variant="danger" onClick={this.statusModalHide}>Close</Button>
                        </Modal.Footer>
                      </Modal>
                    )
                }
          }

          stats = (
            <Modal size = "lg" show={this.state.stats} onHide={this.statsHide} centered>
              <Modal.Header closeButton><h3>Measure Status <br/><small>Total Students: {totalStudents}</small></h3></Modal.Header>
              <Modal.Body className="row">
                <Card className="col-4">
                    <Card.Header><h5>Not Assigned</h5></Card.Header>
                    <Card.Body>body here</Card.Body>
                </Card>
              </Modal.Body>
            </Modal>
          ) 

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
      }

      if(typeTest){
            if(this.props.cycles.measureReport !== null &&
              this.props.cycles.measureReport !== undefined &&
              this.props.cycles.measureReport.report !== null &&
              this.props.cycles.measureReport.report !== undefined){
                let header = (
                  <thead key = {"testHeader"}>
                    <tr>
                      <th>#</th>
                      <th>Student</th>
                      <th>Email</th>
                      <th>Score</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                )
                measureReport.push(header)
                let body = this.props.cycles.measureReport.report.map((student,index) => {
                  let colour = "text-danger"
                  if(student.passing){
                    colour = "text-success"
                  }
                  return (
                      <tr key={student.CWID}>
                        <td>{index+1}</td>
                        <td>{student.studentName}</td>
                        <td>{student.studentEmail}</td>
                        <td className={colour}>{student.score}</td>
                        {student.passing ? <td className="text-success">Pass</td> : 
                        <td className="text-danger">Fail</td>}
                      </tr>
                  )
                })
                measureReport.push(<tbody key = "testBody">{body}</tbody>)
                measureReport = (<Table striped bordered hover>{measureReport}</Table>)
                let passPer = this.props.cycles.measureReport.passingPercentage
                let failPer = 100 - passPer
                if(passPer > this.props.cycles.measureDetails.projectedStudentNumber){
                  status = (<h3>Status: <span className="text-success">Passing</span></h3>)
                }
                else{
                  status = (<h3>Status: <span className="text-danger">Failing</span></h3>)
                }
              progressBar = <ProgressBar>
                          <ProgressBar now = {passPer} variant="success" label={`${passPer}%`}></ProgressBar>
                          <ProgressBar now = {failPer} variant="danger" label={`${failPer}%`}></ProgressBar>
                      </ProgressBar>
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
          {/* <div>
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
                <li className="btn btn-primary brdbtn">
                  Measure Detail
                </li>
              </div>
            </div>
          </div> */}

          <Jumbotron>
            <p id="measure-title-label">Measure Title</p>
            <h4 id="measure-title">{measureTitle}
            
            {typeTest? 
              <button  type="button" data-toggle="tooltip" data-placement="right" title="View Measure Report"
              className="float-right" onClick={this.testReportShow}>
              <i className="fas fa-file-invoice" size="lg"></i>
            </button>
          : null}
            {typeRubric ? 
              <Link to={"/admin/measure/"+this.props.match.params.measureID+"/report"}>
              <button type="button" data-toggle="tooltip" data-placement="right" data-html="true" title= "View Measure Report"
                className="float-right"
                onClick={this.measureReportShow}
              >
              <i className="fas fa-file-invoice" size="lg"></i>
              </button>
              </Link>
              : null}
            </h4>
            <hr/>
            <div className="container ml-0  mb-2 pl-2 pb-2 border border-info">
                  <Button variant="outline-default" className="mt-1" onClick={this.statusModalShow}>{status}</Button>
                  {statusBtn}
                  {progressBar}
                  {statusModal}
                  {stats}
            </div>
             
            
              <Fragment>
                <Card
                  style={{ width: "30%", height: "20em", float: "left" }}
                >
                 <Card.Header><h3>Evaluators  
                 <Button data-toggle="tooltip" data-placement="right" title="Add Evaluators To Measure"
                      variant="primary"
                      className="float-right"
                      onClick={this.addEvalShow}
                    >
                      <i className="fas fa-user-plus"></i>
                    </Button>
                    </h3>
                    
                    </Card.Header>
                  <Card.Body className='mb-1 pt-1'>
                   
                    <ol className="list-group measureCard">{evaluatorList}</ol>

                    <Button className="mt-2" onClick={this.assignStudShow} size="sm">
                  Assign Students
                </Button>
                  </Card.Body>
                </Card>

                <Card style={{ width: "30%", height: "20em" }}>
                  <Card.Header>
                    <h3>
                    Students
                    <Button data-toggle="tooltip" data-placement="right" title="Add Students To Measure"
                      variant="primary"
                      className="float-right"
                      onClick={this.addStudShow}>
                      <i className="fas fa-user-graduate">+</i>
                    </Button>
                    </h3>
                    </Card.Header>
                  <Card.Body>
                    <ol className="list-group measureCard">{studentList}</ol>
                  </Card.Body>
                </Card>

               
                </Fragment>
            
            {typeTest ?
            <Fragment>

                <ButtonGroup aria-label="Basic example" className="float-right">
                <Button size="lg" data-toggle="tooltip" data-placement="right" title="View Measure Report"
              onClick={this.testModalShow}>
              <i className="fas fa-users"></i>
              </Button>
              <Button  size="lg" data-toggle="tooltip" data-placement="right" title="Upload A File"
              onClick={this.uploadTestShow}>
              <i className="fas fa-file-csv"></i>
              </Button>
            </ButtonGroup>

              
             

              <Modal show={this.state.testModal} onHide={this.testModalHide} centered>
            <Modal.Header closeButton><h3>Students</h3></Modal.Header>
               <Modal.Body className="pt-2 pb-1">
                   <Form onSubmit={this.scoreSingleStudent.bind(this)}>
                     <InputGroup>
                        <InputGroup.Prepend>
                                <InputGroup.Text id="basic-addon110" >First Name</InputGroup.Text>
                        </InputGroup.Prepend>
                        <FormControl placeholder='John' name="fName"/>
                     </InputGroup>
                     <InputGroup>
                        <InputGroup.Prepend>
                                <InputGroup.Text id="basic-addon101" >Last Name</InputGroup.Text>
                        </InputGroup.Prepend>
                        <FormControl placeholder='John' name="lName"/>
                     </InputGroup>
                     <InputGroup>
                        <InputGroup.Prepend>
                                <InputGroup.Text id="basic-addon11">Email (@)</InputGroup.Text>
                        </InputGroup.Prepend>
                        <FormControl type="email"placeholder='example@example.com' name="email"/>
                     </InputGroup>
                     <InputGroup>
                        <InputGroup.Prepend>
                                <InputGroup.Text id="basic-addon12">CWID</InputGroup.Text>
                        </InputGroup.Prepend>
                        <FormControl placeholder='12345678' name="CWID"/>
                     </InputGroup>
                     <InputGroup>
                        <InputGroup.Prepend>
                                <InputGroup.Text id="basic-addon13">Score</InputGroup.Text>
                        </InputGroup.Prepend>
                        <FormControl placeholder='85' name="score"/>
                     </InputGroup>
                    
                     <Button type="submit" className="mt-3 mr-3 mb-3 float-right">Submit</Button>
                   </Form>
                  </Modal.Body>
            </Modal>

            <Modal show={this.state.uploadTest} onHide={this.uploadTestHide} centered >
              <Modal.Header closeButton>
                <h3>Upload Test Scores</h3>
                </Modal.Header>
                <Modal.Body>
                  <Form onSubmit={this.uplaodTestScoresHandler.bind(this)}>
                    <Form.Control type="file" onChange={this.fileChangeHandler.bind(this)}/>
                    <Button className="mt-3 float-right" type="submit">Upload</Button>
                  </Form>
                  <CSVFormat/>

                </Modal.Body>
            </Modal>

            <Modal show={this.state.testReport} onHide={this.testReportHide} centered size="lg">
              <Modal.Header closeButton><h3>Test Summary</h3></Modal.Header>
              <Modal.Body>{measureReport}</Modal.Body>
              <Modal.Footer><button className="btn btn-danger" onClick={this.testReportHide}>Close</button></Modal.Footer>
            </Modal>
            </Fragment>
            : null}
          </Jumbotron>
        </section>

        <Modal centered show={this.state.addStud} onHide={this.addStudHide}>
          <Modal.Header className="ml-3" closeButton>Add Student to Measure</Modal.Header>
          <Modal.Body>
            <Form onSubmit={this.addStudentsHandler.bind(this)}>
              <InputGroup>
                <InputGroup.Append>
                  <InputGroup.Text>First Name</InputGroup.Text>
                </InputGroup.Append>
                <Form.Control name="fName" placeholder="eg. John" />
              </InputGroup>
              <InputGroup>
                <InputGroup.Append>
                  <InputGroup.Text>Last Name</InputGroup.Text>
                </InputGroup.Append>
                <Form.Control name="lName" placeholder="eg. Doe" />
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
          <Modal.Header className="ml-3" closeButton><h3>Upload Students File</h3></Modal.Header>
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
            <CSVFormat className="mt-3"/>

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
                <select name="assignedStudents" multiple>
                  {studentSelect}
                </select>
              </div>

              <Button type="submit" className="mt-3 d-block">
                Submit{" "}
              </Button>
            </Form>
          </ModalBody>
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
  assignStudents: state.assugnedStudents,
  evaluator: state.evaluator
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
