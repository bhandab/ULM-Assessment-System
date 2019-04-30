import React, { Component, Fragment } from "react";
import {
  getOutcomesMeasures,
  linkMeasureToOutcome,
  getStudentsOfMeasure,
  addNewCourse
} from "../../actions/assessmentCycleAction";
import { getMeasures } from "../../actions/measuresAction";
import { getAllRubrics, getSingleRubric } from "../../actions/rubricsAction";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import {
  Form,
  Button,
  InputGroup,
  Modal,
  Spinner,
  Card,
  Badge,
  Row,
  Col,
  ListGroup
} from "react-bootstrap";
import { isEmpty } from "../../utils/isEmpty";

class OutcomeMeasures extends Component {
  state = {
    addMeasuresShow: false,
    createMeasuresShow: false,
    toolTypeVal: "",
    testType: "scored",
    hiddenClass: "",
    isActive : false,
    cMap: false,
    cAdd: false

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
    this.props.getOutcomesMeasures(cycleID, outcomeID);
    this.props.getAllRubrics(cycleID, outcomeID);
    this.props.getMeasures();
  }

  componentDidUpdate(prevProps){
    if(!this.props.cycles.cycleLoading){
      if(this.props.cycles.outcomeMeasures !== prevProps.cycles.outcomeMeasures){
        this.setState({isActive : !this.props.cycles.outcomeMeasures.isClosed})
      }
    }
  }

  measureAddHandler = e => {
    e.preventDefault();
    let index = e.target.measures.value;
    const measure = this.props.measures.measures[index];
    let scoreOrPass = null
    if(measure.projectedResult !== null){
      scoreOrPass = "score"
    }
    else {
      scoreOrPass = "pass"
    }
    const measureDetails = {
      projectedStudentNumber: measure.projectedStudentNumber + "",
      course: measure.course,
      toolType: measure.toolType,
      toolTitle: measure.toolName,
      toolID: measure.toolID + "",
      scoreOrPass : scoreOrPass,
      studentNumberOperator: measure.studentNumberScale,
      projectedValue: measure.projectedResult + "",
      valueOperator: measure.resultScale
      
      
    };
    this.props.linkMeasureToOutcome(
      this.props.match.params.cycleID,
      this.props.match.params.outcomeID,
      measureDetails
    );
    this.setState({ addMeasuresShow: false });
  };

  measureCreateHandler = e => {
    e.preventDefault();

    const cycleID = this.props.match.params.cycleID;
    const outcomeID = this.props.match.params.outcomeID;

    let pjsn = e.target.projectedStudentNumber.value;
    let pv =  null;
    let crs = e.target.course.value;
    let tt = "";

    let ty = e.target.toolType.value;
    let tid = ""; //null
    if (ty === "rubric") {
      const selected = e.target.tool.options[e.target.tool.selectedIndex];
      console.log(selected);
      tid = selected.dataset.id;
      pv = e.target.projectedValue.value;
      tt = selected.dataset.name;
    }
    let pt = e.target.projType.value;
    let vo = "";

    let testType = ""; //null
    console.log(testType);

    if (ty === "test") {
      tt = e.target.tool.value;
      testType = e.target.testType.value;
      if (testType === "score") {
        vo = e.target.valueOperator.value;
        pv = e.target.projectedValue.value;
      }
    }
    const measureDetails = {
      projectedStudentNumber: pjsn,
      projectedValue: pv,
      course: crs,
      toolTitle: tt,
      toolID: tid,
      toolType: ty,
      valueOperator: vo,
      studentNumberOperator: pt,
      scoreOrPass: testType
    };
    console.log(measureDetails)
    this.props.linkMeasureToOutcome(cycleID, outcomeID, measureDetails);
  };

  addMeasuresShow = () => {
    this.createMeasureHide();
    this.setState({ addMeasuresShow: true });
  };

  addMeasuresHide = () => {
    this.setState({ addMeasuresShow: false});
  };

  createMeasuresShow = () => {
    this.setState({ createMeasuresShow: true });
  };

  createMeasureHide = () => {
    this.setState({ createMeasuresShow: false, testType: "scored" });
  };

  cMapShow = () => {
    this.setState({cMap:true})
  }
  cMapHide = () => {
    this.setState({cMap:false})
  }


  testTypeChange = e => {
    const type = e.target.value;
    if (type === "pass") {
      this.setState({ testType: "pass/fail", hiddenClass: "d-none" });
    } else {
      this.setState({ testType: "scored", hiddenClass: "" });
    }
  };
  measureTitleClick = e => {
    console.log(e.target.dataset);
    this.props.getStudentsOfMeasure(e.target.value);
  };
  passingPer = (part, total) => {
    if (total === 0 || part === 0) {
      return "0%";
    }
    const per = ((part / total) * 100).toFixed(1);
    return per + "%";
  };

  addNewCourse = (e) => {
    e.preventDefault()
    const cycleID = this.props.match.params.cycleID
    const outcomeID = this.props.match.params.outcomeID
    const course = e.target.courseName.value
    this.props.addNewCourse(cycleID, outcomeID, course)
    this.setState({cAdd:false})
    
  }

  render() {
    // console.log(this.props)
    console.log(window.location.hash.substr(1))
    let outcomeCourses = null
    let totalStudents = 0;
    let measures = <Spinner animation="border" variant="primary" />;
    let measureTitle = null;

    if (
      this.props.cycles.measureStudents !== null &&
      this.props.cycles.cycleLoading === false
    ) {
      totalStudents = this.props.cycles.measureStudents.students.length;
    }

    if (this.props.cycles.cycleLoading === false) {
      if (
        this.props.cycles.outcomeMeasures !== null &&
        this.props.cycles.outcomeMeasures !== undefined
      ) {
        if (this.props.cycles.outcomeMeasures.measures.length > 0) {
          measures = this.props.cycles.outcomeMeasures.measures.map(
            (measure, index) => {
              return (
                <Card key={"measure" + index}>
                  <Card.Header className="measureTitle" id={"measure" + index}>
                    <h5 className="mb-0">
                      <button
                        className="btn btn-link"
                        type="button"
                        data-toggle="collapse"
                        data-target={"#measureCollapse" + index}
                        aria-expanded="true"
                        aria-controls={"measureCollapse" + index}
                        data-id={measure.measureID}
                        value={measure.measureID}
                        onClick={this.measureTitleClick.bind(this)}
                        style={{ fontSize: "1.2em", color: "#800000" }}
                      >
                       {measure.displayIndex}. {measure.measureName}
                      </button>
                      {measure.measureStatus ? (
                        <Link
                        to={
                          "/admin/cycles/cycle/" +
                          this.props.cycles.outcomeMeasures.cycleID +
                          "/outcomes/" +
                          this.props.cycles.outcomeMeasures.outcomeID +
                          "/measures/" +
                          measure.measureID
                        }
                      >
                         <Button
                          size="lg"
                          variant="outline-light"
                          className="rounded float-right"
                        >
                          <Badge pill variant="success">PASSING</Badge>
                        </Button>
                      </Link>
                       
                      ) : (
                        <Link
                        to={
                          "/admin/cycles/cycle/" +
                          this.props.cycles.outcomeMeasures.cycleID +
                          "/outcomes/" +
                          this.props.cycles.outcomeMeasures.outcomeID +
                          "/measures/" +
                          measure.measureID
                        }
                      >
                          <Button
                          size="lg"
                          variant="outline-light"
                          className="float-right rounded"
                        >
                          <Badge pill variant="danger">FAILING&nbsp;</Badge>
                        </Button>
                      </Link>
                       
                      )}
                    </h5>
                  </Card.Header>
                  <div
                    id={"measureCollapse" + index}
                    className="collapse"
                    aria-labelledby={"heading" + index}
                    data-parent="#assignedMeasure"
                  >
                    <div className="card-body">
                      <Card>
                        <Card.Body>

                            <Row style={{fontSize:'1.7em'}}>
                              <Col><Badge>Total Students: {totalStudents}</Badge></Col>
                              <Col><Badge> Total Evaluated: {measure.evalCount}</Badge></Col>
                              <Col><Badge> Pending Evaluation:{" "}
                              {totalStudents - measure.evalCount}</Badge></Col>
                              <Col><Badge> Passing Count: {measure.successCount} (
                              {this.passingPer(
                                measure.successCount,
                                measure.evalCount
                              )}
                              )</Badge></Col>
                              <Col><Badge> Failing Count:{" "}
                              {measure.evalCount - measure.successCount} </Badge></Col>
                            </Row>
                          
                          <Link
                            to={
                              "/admin/cycles/cycle/" +
                              this.props.cycles.outcomeMeasures.cycleID +
                              "/outcomes/" +
                              this.props.cycles.outcomeMeasures.outcomeID +
                              "/measures/" +
                              measure.measureID
                            }
                          >
                            <Button className="mt-2 float-right">
                              View Details
                            </Button>
                          </Link>
                        </Card.Body>
                      </Card>
                    </div>
                  </div>
                </Card>
              );
            }
          );
          measureTitle = this.props.cycles.outcomeMeasures.outcomeName;
        } else {
          measures = (
            <li className="list-group-item">
              No measures present for this outcome
            </li>
          );
        }
        measureTitle = this.props.cycles.outcomeMeasures.outcomeName;

        outcomeCourses = this.props.cycles.outcomeMeasures.outcomeCourses.map(course => {
          return (
            <ListGroup.Item key={"crCourse"+course.courseID}>
              {course.courseCode}
            </ListGroup.Item>
          )
        })

        if(outcomeCourses.length < 1){
          outcomeCourses =  <ListGroup.Item key={"nocrCourse"}>
              No Course Present
            </ListGroup.Item>
        }

      }
    }

    let selections = null;
    if (this.props.cycles.cycleLoading !== true) {
      if (
        this.props.measures.measures !== null &&
        this.props.measures.measures !== undefined &&
        this.props.cycles.outcomeMeasures !== null &&
        this.props.cycles.outcomeMeasures !== undefined
      ) {
        let outcomeMeasures = this.props.cycles.outcomeMeasures.measures;
        selections = this.props.measures.measures.map((item, index) => {
          const measure = outcomeMeasures.find(measure => {
            return measure.measureName === item.measureDescription;
          });
          if (measure === undefined) {
            return (
              <option key={index} value={index}>
                {item.measureDescription}
              </option>
            );
          } else {
            return null;
          }
        });
        if (selections.length === 0) {
          selections = <option disabled>No Measures Present</option>;
        }
      }
    }

    let toolType = e => {
      this.setState({ toolTypeVal: e.target.value });
    };

    let rubricOptions = null;
    if (isEmpty(this.props.rubric.rubrics) === false) {
      rubricOptions = this.props.rubric.rubrics.rubrics.map(rubric => {
        return (
          <option
            key={rubric.rubricID}
            data-name={rubric.rubricTitle}
            data-id={rubric.rubricID}
          >
            {rubric.rubricTitle}
          </option>
        );
      });
    }

    let rubricScoreOptions = null;
    const rubricChangeHandler = e => {
      const selected = e.target.options[e.target.selectedIndex];

      console.log(selected);
      let rubricID = selected.dataset.id;
      this.props.getSingleRubric(rubricID, true);
    };

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
    console.log(this.props);
    return (
      <Fragment>
        {/* <div className="container">
                        <div className="row">
                            <div className="btn-group btn-breadcrumb">
                                <li className="btn btn-primary">Admin</li>
                                <li className="btn btn-primary">Cycles</li>
                                <li className="btn btn-primary">Outcomes</li>
                                <li className="btn btn-primary">Measures</li>
                            </div>
                        </div>
                    </div> */}
                    <section className="panel important border border-info rounded p-3">
        <Card>
          <Card.Header>
          <p style={{fontSize:'20px'}} id="measure-title-label"><strong>OUTCOME</strong></p>
            <h2>
              {measureTitle}
              <Link
                to={{
                  pathname: `/admin/cycles/cycle/${
                  this.props.match.params.cycleID
                }/outcome/${this.props.match.params.outcomeID}/report`,
                hash: window.location.hash
              }}
              >
                <button
                  size="lg"
                  variant="outline-primary"
                  className="float-right"
                >
                  <i className="fas fa-file-invoice" />
                </button>
              </Link>
            </h2>
          </Card.Header>
          <Card.Body>
            <div className="accordion" id="assignedMeasure">
              {measures}
            </div>
            { this.state.isActive ?
            <> 
             <button
              onClick={this.createMeasuresShow}
              className="btn btn-primary mt-3"
            >
              Create Measure
            </button>
            <Button variant="secondary"
            className="btn mt-3 ml-3"
            onClick={this.cMapShow}
          >
            Curriculum Mapping
          </Button>
            </>
            : null}
          </Card.Body>
        </Card>
        </section>
        <Modal
          aria-labelledby="contained-modal-title-vcenter"
          centered
          show={this.state.addMeasuresShow}
          onHide={this.addMeasuresHide}
          size="lg"
        >
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-vcenter">
              Add New Measure
            </Modal.Title>
          </Modal.Header>
          <Form onSubmit={this.measureAddHandler.bind(this)} className="p-3">
            <InputGroup className="mt-2 mb-2">
              <InputGroup.Prepend>
                <InputGroup.Text id="basic-addon7" className="text-bold">
                  Select A Measure:
                </InputGroup.Text>
              </InputGroup.Prepend>
              <select name="measures" className="custom-select">
                {selections}
              </select>
            </InputGroup>
            <Button type="submit" className="mt-3 float-right" value="submit">
              Submit
            </Button>
          </Form>
          <Modal.Body />
        </Modal>

        <section className="panel important">
          <Modal
            size="lg"
            centered
            show={this.state.createMeasuresShow}
            onHide={this.createMeasureHide}
          >
            <Modal.Header closeButton>
              <Modal.Title id="contained-modal-title-vcenter">
                Create New Measure
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form onSubmit={this.measureCreateHandler.bind(this)}>
                <InputGroup className="mb-3 ml-0 row">
                  <InputGroup.Prepend>
                    <InputGroup.Text id="basic-addon1">
                      At least
                    </InputGroup.Text>
                  </InputGroup.Prepend>
                  <Form.Control
                    type="number"
                    className="col-md-4"
                    placeholder="Projected Student Number"
                    aria-label="Projected Student Number"
                    aria-describedby="basic-addon1"
                    name="projectedStudentNumber"
                  />
                  <select
                    name="projType"
                    className="custom-select col-sm-2"
                    id="basic-addon1"
                    defaultValue={"null"}
                  >
                    <option value="null" disabled>
                      Select
                    </option>
                    <option value="%">%</option>
                  </select>
                  <InputGroup.Append>
                    <InputGroup.Text id="basic-addon2">
                      of students completing
                    </InputGroup.Text>
                  </InputGroup.Append>
                </InputGroup>

                <InputGroup className="mb-3 ml-0 row">
                  <Form.Control
                    className="col-md-3"
                    placeholder="Course Name"
                    name="course"
                  />
                  <InputGroup.Append>
                    <InputGroup.Text id="basic-addon3">
                      graded in
                    </InputGroup.Text>
                  </InputGroup.Append>
                  <select
                    onChange={e => toolType(e)}
                    name="toolType"
                    className="custom-select col-sm-2"
                    id="toolType"
                    defaultValue="null"
                  >
                    <option default disabled value="null">
                      Select a Tool
                    </option>
                    <option value="rubric">rubric</option>
                    <option value="test">test</option>
                  </select>

                  {this.state.toolTypeVal === "rubric" ? (
                    <select
                      name="tool"
                      className="custom-select col-sm-4"
                      defaultValue={"null"}
                      onChange={e => rubricChangeHandler(e)}
                    >
                      <option disabled value="null">
                        Select A Rubric
                      </option>
                      {rubricOptions}
                    </select>
                  ) : (
                    <input
                      name="tool"
                      defaultValue={""}
                      className="custom-select col-sm-4"
                      placeholder="Test Name"
                    />
                  )}
                </InputGroup>
                <InputGroup className="row mb-3 ml-0">
                  {this.state.toolTypeVal === "rubric" ? (
                    <InputGroup.Append>
                      <InputGroup.Text id="basic-addon4">
                        will score
                      </InputGroup.Text>
                    </InputGroup.Append>
                  ) : (
                    <>
                      <InputGroup.Append>
                        <InputGroup.Text id="basic-addon4">
                          will
                        </InputGroup.Text>
                      </InputGroup.Append>
                      <select
                        defaultValue=""
                        name="testType"
                        onChange={this.testTypeChange.bind(this)}
                      >
                        <option default value="" disabled>
                          Score/Pass
                        </option>
                        <option value="score">score</option>
                        <option value="pass">pass</option>
                      </select>
                    </>
                  )}
                  {this.state.toolTypeVal === "rubric" ? (
                    <select
                      className="col-md-2"
                      placeholder="Rubric Score"
                      name="projectedValue"
                    >
                      {rubricScoreOptions}
                    </select>
                  ) : (
                    <Form.Control
                      className={`col-md-2 ${this.state.hiddenClass}`}
                      placeholder="Score"
                      name="projectedValue"
                    />
                  )}

                  {this.state.toolTypeVal === "rubric" ? null : (
                    <select
                      name="valueOperator"
                      className={this.state.hiddenClass}
                    >
                      <option value="%">%</option>
                      <option value="percentile">percentile</option>
                    </select>
                  )}
                  <InputGroup.Append className={this.state.hiddenClass}>
                    <InputGroup.Text id="basic-addon4">
                      or greater.
                    </InputGroup.Text>
                  </InputGroup.Append>
                </InputGroup>

                <Button
                  className="float-right btn btn-primary mt-3"
                  variant="primary"
                  type="submit"
                  onClick={this.createMeasureHide}
                >
                  Create
                </Button>
              </Form>
              <button
              onClick={this.addMeasuresShow}
              className="btn btn-info  ml-3 mt-3"
            >
              Add Existing
            </button>
            </Modal.Body>
          </Modal>
        </section>
        <Modal show={this.state.cMap} onHide={this.cMapHide} size="lg" centered>
        <Modal.Header closeButton><h2>
        <Button className="mr-3"
        onClick={()=>this.setState({cAdd:true})}
        ><i className="fas fa-plus"></i></Button>
          Curriculum Mapping
          
          </h2></Modal.Header>
        <Modal.Body>
          {outcomeCourses}
          {this.state.cAdd ?
          <ListGroup.Item className="row">
              <Form onSubmit={this.addNewCourse.bind(this)}>
                <InputGroup>
                  <InputGroup.Append>
                    <InputGroup.Text>
                      Course Name
                    </InputGroup.Text>
                  </InputGroup.Append>
                  <Form.Control placeholder="eg. CSCI 4040" name="courseName" />
                  <Button className="col-2" variant="success" type="submit"><i className="fas fa-check"></i></Button>
                  <Button className="col-2" variant="danger" onClick={()=> this.setState({cAdd:false})}><i className="fas fa-times"></i></Button>

                </InputGroup>
              </Form>
          </ListGroup.Item>
          : null }
        </Modal.Body>
            <Modal.Footer>
              <Button variant="danger" className="float-right" onClick={this.cMapHide}>Close</Button>
            </Modal.Footer>
        </Modal>
      </Fragment>
    );
  }
}

OutcomeMeasures.propTypes = {
  getOutcomesMeasures: PropTypes.func.isRequired,
  getMeasures: PropTypes.func.isRequired,
  linkMeasureToOutcome: PropTypes.func.isRequired,
  getAllRubrics: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired,
  getSingleRubric: PropTypes.func.isRequired
};

const MapStateToProps = state => ({
  outcomeMeasures: state.outcomeMeasures,
  cycles: state.cycles,
  measures: state.measures,
  errors: state.errors,
  auth: state.auth,
  rubric: state.rubric,
  measureDetails: state.measureDetails
});

export default connect(
  MapStateToProps,
  {
    getOutcomesMeasures,
    getMeasures,
    linkMeasureToOutcome,
    getAllRubrics,
    getSingleRubric,
    getStudentsOfMeasure,
    addNewCourse
  }
)(OutcomeMeasures);
