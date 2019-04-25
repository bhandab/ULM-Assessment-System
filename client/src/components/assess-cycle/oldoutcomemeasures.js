import React, { Component, Fragment } from "react";
import {
  getOutcomesMeasures,
  linkMeasureToOutcome
} from "../../actions/assessmentCycleAction";
import { getMeasures } from "../../actions/measuresAction";
import { getAllRubrics, getSingleRubric } from "../../actions/rubricsAction";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { Form, Button, InputGroup, Modal, Spinner, Card, ListGroup} from "react-bootstrap";
import { isEmpty } from "../../utils/isEmpty";

class OutcomeMeasures extends Component {
  state = {
    addMeasuresShow: false,
    createMeasuresShow: false,
    toolTypeVal: "",
    testType:'scored',
    hiddenClass: ""
  };

  componentDidMount() {
    if (!this.props.auth.isAuthenticated && this.props.auth.user.role !== "coordinator") {
      this.props.history.push('/login')
    }

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
      measureDescription: measure.measureDescription,
      projectedStudentNumber: measure.projectedStudentNumber+"",
      projectedValue: measure.projectedResult+"",
      course: measure.course,
      toolTitle: measure.toolName,
      toolID: measure.toolID+"",
      toolType: measure.toolType,
      valueOperator: measure.resultScale,
      studentNumberOperator: measure.studentNumberScale

    }
    this.props.linkMeasureToOutcome(this.match.params.cycleID, this.props.match.params.outcomeID, measureDetails)
    this.setState({ addMeasuresShow: false})
  };

  measureCreateHandler = e => {
    e.preventDefault();

    const cycleID = this.props.match.params.cycleID;
    const outcomeID = this.props.match.params.outcomeID;


    let pjsn = e.target.projectedStudentNumber.value;
    let pv = e.target.projectedValue.value;
    let crs = e.target.course.value;
    let tt = e.target.tool.value.replace(/[0-9]/g, "");
    
    let ty = e.target.toolType.value;
    let tid = ""
    if (ty === 'rubric'){tid = e.target.tool.value.replace(/\D/g, "");}
    let pt = e.target.projType.value;
    let vo = ""
    if(ty === 'test'){
      vo = e.target.valueOperator.value
    }
    const measureDescr =
      "At least " +
      pjsn +
      pt +
      " of students completing " +
      crs +
      " will score " +
      pv +""+ vo +
      " or greater in " +
      ty +
      " " +
      "'"+tt+"'"+ + 
      "."

    const measureDetails = {
      measureDescription: measureDescr,
      projectedStudentNumber: pjsn,
      projectedValue: pv,
      course: crs,
      toolTitle: tt,
      toolID: tid,
      toolType : ty,
      valueOperator: vo,
      studentNumberOperator: pt

    };
    this.props.linkMeasureToOutcome(cycleID, outcomeID, measureDetails)
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
    this.setState({ createMeasuresShow: false,  });
  };

  testTypeChange = e => {
    const type = e.target.value
    if(type === 'pass'){
    this.setState({testType:"pass/fail", hiddenClass:'d-none'})
    }
    else {
      this.setState({testType:"scored",hiddenClass:''})
    }
  }


  render() {
    console.log(this.props)
    let measures = <Spinner animation="border" variant="primary" />;
    let measureTitle = null;
    if (this.props.cycles.cycleLoading === false) {
      if (this.props.cycles.outcomeMeasures !== null && this.props.cycles.outcomeMeasures !== undefined) {
        if (this.props.cycles.outcomeMeasures.measures.length > 0) {
          measures = this.props.cycles.outcomeMeasures.measures.map(measure => {
            return (
              <ListGroup.Item key={measure.measureID}>
                <Link className='col-9'
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
                {measure.measureStatus ? 
                <span className="p-2 text-success rounded float-right">
                <strong><i className="fas fa-check-circle"></i></strong>
                </span> 
                : <span className="p-2 text-danger float-right rounded">
                <strong><i className="fas fa-times-circle"></i></strong>
                </span> }
              </ListGroup.Item>
            );
          });
          measureTitle = this.props.cycles.outcomeMeasures.outcomeName;
        } else {
          measures = <li className="list-group-item">No measures present for this outcome</li>;
        }
        measureTitle = this.props.cycles.outcomeMeasures.outcomeName;
      }
    }

    let selections = null;
    if (this.props.cycles.cycleLoading !==true) {
      if (this.props.measures.measures !== null && 
        this.props.measures.measures !== undefined && 
        this.props.cycles.outcomeMeasures !== null &&
        this.props.cycles.outcomeMeasures !== undefined) {
        let outcomeMeasures = this.props.cycles.outcomeMeasures.measures
        selections = this.props.measures.measures.map((item, index) => {
          const measure = outcomeMeasures.find(measure=> {
            return measure.measureName === item.measureDescription
          })
          if(measure === undefined){
          return (
            <option key={index} value={index}>
              {item.measureDescription}
            </option>
          );}
          else{
            return null
          }
        });
        if (selections.length === 0) {
          selections = <option disabled>No Measures Present</option>
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
            value={rubric.rubricTitle + rubric.rubricID}
          >
            {rubric.rubricTitle}
          </option>
        );
      });
    }

    let rubricScoreOptions = null
    const rubricChangeHandler = (e) => {
    let rubricID = e.target.value.replace(/\D/g, "");
        this.props.getSingleRubric(rubricID, true)
    }

    if(isEmpty(this.props.rubric.singleRubric) === false){
      rubricScoreOptions = this.props.rubric.singleRubric.rubricDetails.scaleInfo.map(scale => {
        return (
          <option key = {"scale"+scale.scaleID} value = {scale.scaleValue}>{scale.scaleDescription}</option>
        )
      })
    }

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
          <Card>
            <Card.Header>
          <h2>{measureTitle}<Button size="lg" variant="outline-primary" className="float-right"><i className="fas fa-book"></i></Button></h2>
          </Card.Header>
          <Card.Body>
          <ListGroup>{measures}</ListGroup>
          
          <button
            onClick={this.addMeasuresShow}
            className="btn btn-primary  ml-3 float-right mt-3"
          >
            Add Measure
          </button>
          <button
            onClick={this.createMeasuresShow}
            className="btn btn-primary float-right mt-3"
          >
            Create Measure
          </button>
          </Card.Body>
          </Card>

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
                    defaultValue = {'null'}
                  >
                    <option value='null' disabled>Select</option>
                    <option value="%">%</option>
                    <option value="p">percentile</option>
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
                    defaultValue='null'
                  > 
                    <option default disabled value="null">Select a Tool</option> 
                    <option value="rubric">rubric</option>
                    <option value="test">test</option>
                  </select>

                  {this.state.toolTypeVal === "rubric" ? (
                    <select name="tool" className="custom-select col-sm-4"
                    defaultValue={'null'}
                    onChange={(e)=>rubricChangeHandler(e)}
                    >
                      <option disabled value="null">Select A Rubric</option>
                      {rubricOptions}
                    </select>
                  ) : (
                      <input name="tool" defaultValue={''} className="custom-select col-sm-4" placeholder="Test Name"/>
                    )}
                </InputGroup>
                    <InputGroup className = "row mb-3 ml-0">
                    {this.state.toolTypeVal ==="rubric" ? 
                  <InputGroup.Append>
                    <InputGroup.Text id="basic-addon4">
                      will score
                    </InputGroup.Text>
                  </InputGroup.Append> :
                  <>
                  <InputGroup.Append>
                  <InputGroup.Text id="basic-addon4">
                    will
                  </InputGroup.Text>
                </InputGroup.Append>
                <select name="testType" onChange={this.testTypeChange.bind(this)}>
                  <option value="score">score</option>
                  <option value="pass">pass</option>
                </select></> }
                    {this.state.toolTypeVal === "rubric" ?

                    <select
                      className="col-md-2"
                      placeholder="Rubric Score"
                      name="projectedValue"
                    >
                    {rubricScoreOptions}
                    </select>
                    : <Form.Control
                      className={`col-md-2 ${this.state.hiddenClass}`}
                      placeholder="Score"
                      name="projectedValue"
                    />}
                  
                  {(this.state.toolTypeVal==="rubric") ? null :
                <select name="valueOperator" className={this.state.hiddenClass}>
                    <option value="%">%</option>
                    <option value="percentile">percentile</option>
                </select>
                }
                  <InputGroup.Append className={this.state.hiddenClass}>
                    <InputGroup.Text id="basic-addon4">
                      or greater.
                    </InputGroup.Text>
                  </InputGroup.Append>
                </InputGroup>
               
                <Button
                  className="float-right btn btn-primary"
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
  rubric: state.rubric
});

export default connect(
  MapStateToProps,
  {
    getOutcomesMeasures,
    getMeasures,
    linkMeasureToOutcome,
    getAllRubrics,
    getSingleRubric
  }
)(OutcomeMeasures);