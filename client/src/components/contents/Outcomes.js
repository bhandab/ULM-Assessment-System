import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { getOutcomes } from "../../actions/outcomesAction";
import PropTypes from "prop-types";
import {Spinner, ListGroup, Card, Button} from 'react-bootstrap';

class Outcomes extends Component {


    componentDidMount() {
        if(this.props.auth.isAuthenticated){
            this.props.getOutcomes(this.props.auth.user.id && this.props.auth.user.role !== "coordinator");
        }
        else{
            this.props.history.push('/login')
        }

    }

 
    render() {
        let outcomesList = null
        if (this.props.outcomes.outcomes === null) {
            outcomesList = <Spinner animation='border' variant="primary"></Spinner>
        }
        else {
            outcomesList = this.props.outcomes.outcomes.map( (outcome, index) =>
                <ListGroup.Item  key={index}>{outcome}</ListGroup.Item>
            )
            if(outcomesList.length === 0) {
                outcomesList = <ListGroup.Item  key="0">No Outcomes Present</ListGroup.Item>
            }
        }

        return (
            <Fragment>
                <section className="panel important border border-info rounded p-3">
                <Card>
                    <Card.Header><h2> List of Outcomes 
                    <Button variant="danger" className="float-right" onClick={()=>this.props.history.goBack()}><i className="fas fa-times"></i></Button>
                        </h2></Card.Header>
                    <Card.Body>
                    <ListGroup>
                        {outcomesList}
                    </ListGroup>
                    </Card.Body>
                </Card>
                   
                </section>
            </Fragment>

        )
    }
}

Outcomes.propTypes = {
    auth: PropTypes.object.isRequired,
    getOutcomes: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
    auth: state.auth,
    outcomes: state.outcomes
});

export default connect(
    mapStateToProps,
    { getOutcomes}
)(Outcomes);
