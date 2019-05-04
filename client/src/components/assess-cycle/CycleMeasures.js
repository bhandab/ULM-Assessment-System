import React, { Component, Fragment } from "react";
import {
  getCycleMeasures,
  linkOutcomeToCycle,
  updateOutcomeName,
  deleteOutcome
} from "../../actions/assessmentCycleAction";
import { getOutcomes } from "../../actions/outcomesAction";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Spinner,
   Modal,
    Form,
     Button,
      InputGroup, 
      Card,
      ListGroup,
      Badge, Dropdown
     } from "react-bootstrap";
import Delete from "../../utils/Delete";

class CycleMeasures extends Component {
  state = {
    addOutcome: false,
    createOutcome: false,
    editShow: false,
    deleteShow: false,
    outcomeName: "",
    outcomeID: null,
    isActive: true,
  };

  componentDidMount() {
    if (
      !this.props.auth.isAuthenticated &&
      this.props.auth.user.role !== "coordinator"
    ) {
      this.props.history.push("/login");
    }

    let id = this.props.match.params.cycleID;
    this.props.getCycleMeasures(id);
  }

  componentDidUpdate(prevProps){
    if(!this.props.cycles.cycleLoading){
      if(this.props.cycles.cycleMeasures !== prevProps.cycles.cycleMeasures){
        this.setState({isActive : this.props.cycles.cycleMeasures.isClosed})
      }
    }
  }

  clickHandler = e => {
    e.preventDefault();

    if (!this.state.addOutcomes) {
      this.props.getOutcomes();
    }
    this.setState({ addOutcomes: !this.state.addOutcomes });
  };

  outcomeAddHandler = e => {
    e.preventDefault();
    this.setState({ addOutcomes: !this.state.addOutcomes });
    this.props.linkOutcomeToCycle(this.props.match.params.cycleID, {
      outcomeDescription: e.target.outcomes.value
    });
    this.setState({addOutcome:false})
  };

  createNewButtonHandler = e => {
    e.preventDefault();
    this.setState({ createOutcome: !this.state.createOutcome });
  };

  outcomeCreateHandler = e => {
    e.preventDefault();
    this.props.linkOutcomeToCycle(this.props.match.params.cycleID, {
      outcomeDescription: e.target.newOutcome.value
    });
    this.setState({ createOutcome: false });
  };

  createOutcomeShow = () => {
    this.setState({ createOutcome: true });
  };

  createOutcomeHide = () => {
    this.setState({ createOutcome: false });
  };

  addOutcomeShow = () => {
    this.props.getOutcomes();
    this.setState({ addOutcome: true, createOutcome:false });
  };

  addOutcomeHide = () => {
    this.setState({ addOutcome: false });
  };


  editShow = e => {
    this.setState({
      outcomeName: e.target.value,
      outcomeID: e.target.name,
      editShow: true
    });
  };

  editHide = () => {
    this.setState({ editShow: false });
  };

  deleteShow = e => {
    this.setState({
      outcomeName: e.target.value,
      outcomeID: e.target.name,
      deleteShow: true
    });
  };

  deleteHide = () => {
    this.setState({ deleteShow: false });
  };

  saveChangesHandler = e => {
    e.preventDefault();
    const value = e.target.outcomeName.value;
    this.props.updateOutcomeName(
      this.props.match.params.cycleID,
      this.state.outcomeID,
      { outcomeDescription: value }
    );
    this.setState({ outcomeName: "", outcomeID: null, editShow: false });
  };

  outcomeDeleteHandler = () => {
    this.props.deleteOutcome(
      this.props.match.params.cycleID,
      this.state.outcomeID
    );
    this.setState({ outcomeName: "", outcomeID: null, deleteShow: false });
  };

  render() {
    console.log(this.props)
    let title = null;
    let list = <Spinner animation="border" variant="primary" />;
    let outcomeArray = null;

    if (this.props.cycles.cycleLoading !== true) {
      let cycleID = this.props.match.params.cycleID;

      if (
        this.props.cycles.cycleMeasures !== null &&
        this.props.cycles.cycleMeasures !== undefined
      ) {
        if (this.props.cycles.cycleMeasures.outcomes.length > 0) {
          outcomeArray = this.props.cycles.cycleMeasures.outcomes;
          list = this.props.cycles.cycleMeasures.outcomes.map(outcome => {
            return (
              <ListGroup.Item key={outcome.outcomeID}>
              <div>
                <Link
                  to={{
                    pathname: "/admin/cycles/cycle/" +
                    cycleID +
                    "/outcomes/" +
                    outcome.outcomeID,
                    hash: (outcome.displayIndex).toString()
                  }}
                >
                 {outcome.displayIndex}. {outcome.outcomeName}
                </Link>
                { !this.state.isActive ?
                <>
                  <Dropdown drop='left' className="float-right cycle">
                  <Dropdown.Toggle 
                  
                  variant="success" id="dropdown-basic">
                  <i className="fas fa-ellipsis-v"></i>
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                  <Dropdown.Item>
                  <Link to={{
                    pathname: "/admin/cycles/cycle/" +
                    cycleID +
                    "/outcome/" +
                    outcome.outcomeID +"/report",
                    hash: (outcome.displayIndex).toString()
                  }}>
                    <Button variant="success">
                    &nbsp;&nbsp;&nbsp;VIEW REPORT&nbsp;&nbsp;&nbsp;&nbsp;
                    </Button>
                  </Link>
                  </Dropdown.Item>
                  <Dropdown.Item>
                    <Button
                      variant = "info"
                      name={outcome.outcomeID}
                      value={outcome.outcomeName}
                      onClick={this.editShow.bind(this)}
                    >&nbsp;&nbsp;EDIT OUTCOME&nbsp;&nbsp;</Button>
                  </Dropdown.Item>

                  <Dropdown.Item>
                    <Button
                      variant="danger"
                      name={outcome.outcomeID}
                      value={outcome.outcomeName}
                      onClick={this.deleteShow.bind(this)}
                    >DELETE OUTCOME</Button>
                  </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
                </>
                : null }
                {outcome.outcomeStatus.toLowerCase() === 'pending' ?
                <Badge  pill className="ml-2" variant="warning">PENDING</Badge> : null}
                 {outcome.outcomeStatus.toLowerCase() === 'passing' ?
                <Badge  pill className="ml-2" variant="success">PASSING</Badge> : null}
                 {outcome.outcomeStatus.toLowerCase() === 'failing' ?
                <Badge  pill className="ml-2" variant="danger">FAILING</Badge> : null}

                </div>
              </ListGroup.Item>
            );
          });
        } else {
          list = <ListGroup.Item>No Outcomes Present.</ListGroup.Item>;
        }
        title = this.props.cycles.cycleMeasures.cycleName;
      }
    }
    let selections = null;

    if (
      this.props.cycles.cycleMeasures !== undefined &&
      this.props.cycles.cycleMeasures !== null
    ) {
      if (
        this.props.cycles.cycleMeasures !== null &&
        this.props.outcomes.outcomes !== null
      ) {
        outcomeArray = this.props.cycles.cycleMeasures.outcomes;
        selections = this.props.outcomes.outcomes.map((item, index) => {
          const temp = outcomeArray.find(outcome => {
            return outcome.outcomeName === item;
          });
          if (temp === undefined) {
            return (
              <option key={index} value={item}>
                {item}
              </option>
            );
          } else {
            return null;
          }
        });
      }
    }

    return (
      <Fragment>
        <section className="panel important border border-info rounded p-3">
        <ul className="ml-0 mb-0" id="breadcrumb">
        <li className="ml-0"><Link to="/admin/dashboard"><span><i className="fas fa-home mr-1"></i></span>Dashboard </Link></li>
  <li><Link to="/admin/cycles"><span> <i className="fas mr-1 fa-recycle"></i></span>Cycles</Link></li>
  <li><Link to={`/admin/cycles/cycle/${this.props.match.params.cycleID}`}><span><i className="far fa-list-alt"></i></span> Outcomes</Link></li>
</ul>

          <Card>
            <Card.Header>
            <p style={{fontSize:'20px'}} id="measure-title-label"><strong>CYCLE</strong></p>
          <h2> {title}
          <Link to={`/admin/cycles/cycle/${this.props.match.params.cycleID}/report`}>
          <button size="lg" variant="outline-primary" className="float-right">
          <i className="fas fa-file-invoice"></i>
          </button>
          </Link>
          </h2>
          </Card.Header>
          <Card.Body>
          <p style={{fontSize:'15px', background:'grey'}} id="measure-title-label"><strong>Outcomes</strong></p>

          <ListGroup>{list}</ListGroup>
          {!this.state.isActive? 
          <>
          <Button
            className="btn mt-3"
            onClick={this.createOutcomeShow}
          >
            Create Outcome
          </Button>
          </>
          :null }
          </Card.Body>
          </Card>
        </section>

        <Modal
          show={this.state.createOutcome}
          onHide={this.createOutcomeHide}
          aria-labelledby="contained-modal-title-vcenter"
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-vcenter">
              Create New Outcome
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={this.outcomeCreateHandler.bind(this)}>
              <Form.Control
                name="newOutcome"
                defaultValue={this.state.outcomeName}
              />
              <Button className="mt-3 float-right" type="submit">
                Save Changes
              </Button>
            </Form>
            <Button variant="info" size="sm"
            className="mt-3 ml-3"
            onClick={this.addOutcomeShow}
          >
            <strong>Add Existing
            </strong>
          </Button>
          </Modal.Body>
        </Modal>

        <Modal
          show={this.state.addOutcome}
          onHide={this.addOutcomeHide}
          aria-labelledby="contained-modal-title-vcenter"
          centered
          size="lg"
        >
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-vcenter">
              Add an Outcome
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={this.outcomeAddHandler.bind(this)}>
              <InputGroup>
                <InputGroup.Prepend>
                  <InputGroup.Text id="basic-addon7" className="text-bold">
                    Select an Outcome:
                  </InputGroup.Text>
                </InputGroup.Prepend>
                <select name="outcomes" className="custom-select">
                  {selections}
                </select>
              </InputGroup>
              <Button className="mt-3 float-right" type="submit">
                Save Changes
              </Button>
            </Form>
          </Modal.Body>
        </Modal>

        <Modal
          show={this.state.editShow}
          onHide={this.editHide}
          aria-labelledby="contained-modal-title-vcenter"
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-vcenter">
              Edit Outcome Name
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={this.saveChangesHandler.bind(this)}>
              <Form.Control
                name="outcomeName"
                defaultValue={this.state.outcomeName}
              />
              <Button className="mt-3 float-right" type="submit">
                Save Changes
              </Button>
            </Form>
          </Modal.Body>
        </Modal>
        <Delete
          hide={this.deleteHide}
          show={this.state.deleteShow}
          value="Learning Outcome"
          name={this.state.outcomeName}
          delete={this.outcomeDeleteHandler}
        />

      
      </Fragment>
    );
  }
}

CycleMeasures.propTypes = {
  getCycleMeasures: PropTypes.func.isRequired,
  getOutcomes: PropTypes.func.isRequired,
  linkOutcomeToCycle: PropTypes.func.isRequired,
  cycles: PropTypes.object.isRequired,
  updateOutcomeName: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired,
  deleteOutcome: PropTypes.func.isRequired
};

const MapStateToProps = state => ({
  cycleMeasures: state.cycleMeasures,
  cycles: state.cycles,
  outcomes: state.outcomes,
  errors: state.errors,
  auth: state.auth
});

export default connect(
  MapStateToProps,
  {
    getOutcomes,
    linkOutcomeToCycle,
    getCycleMeasures,
    updateOutcomeName,
    deleteOutcome
  }
)(CycleMeasures);
