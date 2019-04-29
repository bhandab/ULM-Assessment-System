import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { getAssessmentCycles} from "../../actions/assessmentCycleAction";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { Spinner, Card, ListGroup} from "react-bootstrap";

class AssessmentCycle extends Component {

  componentDidMount() {
    if (
      !this.props.auth.isAuthenticated ||
      this.props.auth.user.role !== "coordinator"
    ) {
      this.props.history.push("/login");
    }
    this.props.getAssessmentCycles();
  }

  
  render() {
    let cyclesList = null;
    if (
      this.props.cycles.cycles !== null &&
      this.props.cycles.cycles !== undefined
    ) {
      if (
        this.props.cycles.cycles.cycles !== null &&
        this.props.cycles.cycles.cycles !== undefined
      ) {
        cyclesList = this.props.cycles.cycles.cycles.map(cycle => {
          
          if(cycle.isClosed){
          return (
          <ListGroup.Item key={cycle.cycleID}>
            <Link
              to={{
                pathname: "/admin/cycles/cycle/" + cycle.cycleID
              }}
            >
              {cycle.cycleName}
            </Link>
          </ListGroup.Item>
        )}
        else {
          return null;
        }
      });
        if (cyclesList.length === 0) {
          cyclesList = <ListGroup.Item>No Cycles Present</ListGroup.Item>;
        }
      }
    } else {
      cyclesList = <Spinner animation="border" variant="primary" />;
    }

    console.log(this.props)
    return (
      <Fragment>
        <section className="panel important border border-info rounded p-3">
{/*         
          <div className="row">
            <div className="btn-group btn-breadcrumb">
              <li  className="btn btn-primary brdbtn">
                Admin
              </li>
              <li className="btn btn-primary brdbtn">
                Cycles
              </li>
            </div>
          </div> */}

{/* <ol class="breadcrumb v1">
	<li class="breadcrumb-level"><a href="">Level 1</a></li>
	<li class="breadcrumb-level"><a href="">Level 2</a></li>
	<li class="breadcrumb-level"><a>Level 3</a></li>
</ol> */}
          <Card>
            <Card.Header>
          <h2>
            <strong>Past Assessment Cycles</strong>
          </h2>
          </Card.Header>
          <Card.Body>
          <ul className="list-group">
            {cyclesList === null ? (
              <li className="list-group-item">No Cycles Present</li>
            ) : (
              cyclesList
            )}
          </ul>
          </Card.Body>
          </Card>
        </section>
      </Fragment>
    );
  }
}

AssessmentCycle.propTypes = {
  getAssessmentCycles: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  auth: state.auth,
  cycles: state.cycles,
  errors:state.errors
});

export default connect(
  mapStateToProps,
  { getAssessmentCycles}
)(AssessmentCycle);
