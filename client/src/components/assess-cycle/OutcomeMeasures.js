import React, { Component, Fragment } from "react";
import {
  getOutcomesMeasures,
  linkMeasureToOutcome
} from "../../actions/assessmentCycleAction";
import { getMeasures } from "../../actions/measuresAction";
import { getAllRubrics, createRubric } from "../../actions/rubricsAction";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { Form, Button, InputGroup, Modal, Col, Spinner } from "react-bootstrap";
import { isEmpty } from "../../utils/isEmpty";

class OutcomeMeasures extends Component {
  state = {
    addMeasuresShow: false,
    createMeasuresShow: false,
    toolTypeVal: "rubric",
    createRubric: false
  };

  componentDidMount() {
    const cycleID = this.props.match.params.cycleID;
    const outcomeID = this.props.match.params.outcomeID;
    this.props.getOutcomesMeasures(cycleID, outcomeID);
    this.props.getAllRubrics(cycleID, outcomeID);
    this.props.getMeasures();
  }

  measureAddHandler = e => {
    e.preventDefault();
    let index = e.target.measures.value;
    const measure = this.props.measures.measures[index];

    const measureDetails = {
      measureDescription: measure.measureName,
      projectedStudentNumber: measure.projectedStudentNumber + "",
      projectedValue: measure.projectedValue + "",
      course: measure.course
    };

    console.log(measureDetails);

    //this.props.linkMeasureToOutcome(this.props.match.params.cycleID, this.props.match.params.outcomeID, measureDetails)
  };

  measureCreateHandler = e => {
    e.preventDefault();
    const cycleID = this.props.cycles.outcomeMeasures.cycleID;
    const outcomeID = this.props.cycles.outcomeMeasures.outcomeID;

    let pjsn = e.target.projectedStudentNumber.value;
    let pv = e.target.projectedValue.value;
    let crs = e.target.course.value;
    let tt = e.target.tool.value.replace(/[0-9]/g, "");
    let tid = e.target.tool.value.replace(/\D/g, "");
    let ty = e.target.toolType.value;
    let pt = e.target.projType.value;
    tid = parseInt(tid, 10);
    const measureDescr =
      "At least " +
      pjsn +
      pt +
      " of students completing " +
      crs +
      " will score " +
      pv +
      " or greater in " +
      ty +
      " " +
      tt +
      " " +
      tid;
    console.log(tt);
    const measureDetails = {
      measureDescription: measureDescr,
      projectedStudentNumber: pjsn,
      projectedValue: pv,
      course: crs,
      toolTitle: tt,
      toolID: tid
    };
    console.log(measureDetails);
    //this.props.linkMeasureToOutcome(cycleID, outcomeID, measureDetails)
  };

  addMeasuresShow = () => {
    this.setState({ addMeasuresShow: true });
  };

  addMeasuresHide = () => {
    this.setState({ addMeasuresShow: false });
  };

  createMeasuresShow = () => {
    this.setState({ createMeasuresShow: true });
  };

  createMeasureHide = () => {
    this.setState({ createMeasuresShow: false });
  };

  handleRubricCreateHide = () => {
    this.setState({ createRubric: false });
  };

  handleRubricCreateShow = () => {
    this.setState({ createRubric: true });
  };

  saveChangesHandler = e => {
    e.preventDefault();
    console.log(e.target.rubricTitle.value);
    const cycleID = this.props.match.params.cycleID;
    const outcomeID = this.props.match.params.outcomeID;

    const rubricDetails = {
      rubricName: e.target.rubricTitle.value,
      rows: e.target.rows.value,
      columns: e.target.cols.value
    };
    this.props.createRubric(cycleID, outcomeID, rubricDetails);
    //console.log(rubricDetails)
  };

  render() {
    //console.log(this.props)
    let measures = <Spinner animation="border" variant="primary" />;
    let measureTitle = null;
    if (this.props.cycles.outcomeMeasures !== null) {
      if (Object.keys(this.props.cycles.outcomeMeasures).length > 1) {
        if (this.props.cycles.outcomeMeasures.measures.length > 0) {
          measures = this.props.cycles.outcomeMeasures.measures.map(measure => {
            return (
              <li key={measure.measureID}>
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
                  {measure.measureName}
                </Link>
              </li>
            );
          });
          measureTitle = this.props.cycles.outcomeMeasures.outcomeName;
        } else {
          measures = <p>No measures present for this outcome</p>;
        }
        measureTitle = this.props.cycles.outcomeMeasures.outcomeName;
      }
    }

    let selections = null;
    if (Object.keys(this.props.measures).length > 0) {
      //console.log(this.props)
      if (this.props.measures.measures !== null) {
        selections = this.props.measures.measures.map((item, index) => {
          return (
            <option key={index} value={index}>
              {item.measureName}
            </option>
          );
        });
      }
    }

    let toolType = e => {
      this.setState({ toolTypeVal: e.target.value });
    };

    let rubricList = <Spinner animation="border" variant="primary" />;

    if (isEmpty(this.props.rubric.rubrics) === false) {
      rubricList = this.props.rubric.rubrics.rubrics.map(rubric => {
        return (
          <li key={rubric.rubricID}>
            <Link
              to={
                "/admin/cycles/cycle/" +
                this.props.match.params.cycleID +
                "/outcomes/" +
                this.props.match.params.outcomeID +
                "/rubric/" +
                rubric.rubricID
              }
            >
              {rubric.rubricTitle}
            </Link>
          </li>
        );
      });
    }

    let rubricOptions = null;
    if (isEmpty(this.props.rubric.rubrics) === false) {
      rubricOptions = this.props.rubric.rubrics.rubrics.map(rubric => {
        return (
          <option
            key={rubric.rubricID}
            value={rubric.rubricTitle + rubric.rubricID}
          >
            {rubric.rubricTitle}
          </option>
        );
      });
    }
    // console.log(selections)
    return (
      <Fragment>
        <section className="panel important border border-info rounded p-3">
          <h2>{measureTitle}</h2>
          <ol>{measures}</ol>
          <button
            onClick={this.addMeasuresShow}
            className="btn btn-primary  ml-3 float-right"
          >
            Add Measure
          </button>
          <button
            onClick={this.createMeasuresShow}
            className="btn btn-primary float-right"
          >
            Create Measure
          </button>
        </section>

        <Modal
          aria-labelledby="contained-modal-title-vcenter"
          centered
          show={this.state.addMeasuresShow}
          onHide={this.addMeasuresHide}
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
                  {" "}
                  Select A Measure:{" "}
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
          {this.state.addMeasures ? (
            <div>
              <br />
              <h4>Please Select Measure(s):</h4>
              <form onSubmit={this.measureAddHandler.bind(this)}>
                <select name="measures">{selections}</select>
                <br />
                <br />
                <button
                  type="submit"
                  className="btn btn-outline-primary btn-sm"
                  value="submit"
                >
                  Submit
                </button>
              </form>
            </div>
          ) : null}

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
                  >
                    <option value="%">%</option>
                    <option value="p">percentile</option>
                  </select>
                  <InputGroup.Append>
                    <InputGroup.Text id="basic-addon2">
                      {" "}
                      of students completing{" "}
                    </InputGroup.Text>
                  </InputGroup.Append>
                </InputGroup>

                <InputGroup className="mb-3 ml-0 row">
                  <Form.Control
                    className="col-md-2"
                    placeholder="Course Name"
                    name="course"
                  />
                  <InputGroup.Append>
                    <InputGroup.Text id="basic-addon3">
                      {" "}
                      will score{" "}
                    </InputGroup.Text>
                  </InputGroup.Append>
                  <Form.Control
                    className="col-md-2"
                    placeholder="Score"
                    name="projectedValue"
                  />
                  <InputGroup.Append>
                    <InputGroup.Text id="basic-addon4">
                      {" "}
                      or greater in{" "}
                    </InputGroup.Text>
                  </InputGroup.Append>

                  <select
                    onChange={e => toolType(e)}
                    name="toolType"
                    className="custom-select col-sm-2"
                    id="toolType"
                  >
                    <option value="rubric">rubric</option>
                    <option value="test">test</option>
                  </select>

                  {this.state.toolTypeVal === "rubric" ? (
                    <select name="tool" className="custom-select col-sm-2">
                      {rubricOptions}
                    </select>
                  ) : (
                    <select name="tool" className="custom-select col-sm-2">
                      <option value="test1">test1</option>
                      <option value="test2">test2</option>
                    </select>
                  )}
                </InputGroup>
                <Button
                  className="float-right"
                  variant="primary"
                  type="submit"
                  onClick={this.createMeasureHide}
                >
                  Create
                </Button>
              </Form>
            </Modal.Body>
          </Modal>
        </section>

        <section className="panel important border border-primary rounded p-3">
          <h2 className="text-primary">Associated Rubrics</h2>
          <ol>{rubricList}</ol>
          <Button
            variant="primary"
            onClick={this.handleRubricCreateShow}
            className="float-right"
          >
            Create New Rubric
          </Button>

          <Modal
            show={this.state.createRubric}
            onHide={this.handleRubricCreateHide}
          >
            <Modal.Header closeButton>
              <Modal.Title className="font-weight-bold">
                Rubric Details
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form onSubmit={this.saveChangesHandler.bind(this)}>
                <Form.Group>
                  <Form.Label className="font-weight-bold">
                    Rubric Title
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter Rubric Title"
                    name="rubricTitle"
                  />
                </Form.Group>
                <Form.Row className="mb-4">
                  <Col>
                    <Form.Label className="font-weight-bold">Rows</Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="No. of Rows"
                      min="0"
                      max="15"
                      name="rows"
                    />
                  </Col>
                  <Col>
                    <Form.Label className="font-weight-bold">
                      Columns
                    </Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="No. of Cols"
                      min="0"
                      max="15"
                      name="cols"
                    />
                  </Col>
                </Form.Row>
                <Button
                  variant="secondary"
                  className="float-right ml-2"
                  onClick={this.handleClose}
                >
                  Close
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  className="float-right"
                  onClick={this.handleClose}
                >
                  Save Changes
                </Button>
              </Form>
            </Modal.Body>
          </Modal>
        </section>
      </Fragment>
    );
  }
}

OutcomeMeasures.propTypes = {
  getOutcomesMeasures: PropTypes.func.isRequired,
  getMeasures: PropTypes.func.isRequired,
  linkMeasureToOutcome: PropTypes.func.isRequired,
  getAllRubrics: PropTypes.func.isRequired,
  createRubric: PropTypes.func.isRequired
};

const MapStateToProps = state => ({
  outcomeMeasures: state.outcomeMeasures,
  cycles: state.cycles,
  measures: state.measures,
  errors: state.errors,
  //rubrics: state.rubrics,
  rubric: state.rubric
});

export default connect(
  MapStateToProps,
  {
    getOutcomesMeasures,
    getMeasures,
    linkMeasureToOutcome,
    getAllRubrics,
    createRubric
  }
)(OutcomeMeasures);
