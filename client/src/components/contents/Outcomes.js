import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { getOutcomes } from "../../actions/outcomesAction";
import PropTypes from "prop-types";
import {Spinner} from 'react-bootstrap';

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
        console.log(this.props)
        let outcomesList = null
        if (this.props.outcomes.outcomes === null) {
            outcomesList = <Spinner animation='border' variant="primary"></Spinner>
        }
        else {
            outcomesList = this.props.outcomes.outcomes.map( (outcome, index) =>
                <li className="list-group-item" key={index}>{outcome}</li>
            )
            if(outcomesList.length === 0) {
                outcomesList = <li className="list-group-item" key="0">No Outcomes Present</li>
            }
        }

        return (
            <Fragment>
                <section className="panel important border border-info rounded p-3">
                    <h2> List of Outcomes </h2>
                    <hr />
                    <ol className="list-group">
                        {outcomesList}
                    </ol>
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
