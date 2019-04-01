import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { getOutcomes } from "../../actions/outcomesAction";
import PropTypes from "prop-types";
import {Spinner} from 'react-bootstrap';

class Outcomes extends Component {


    componentDidMount() {
        this.props.getOutcomes(this.props.auth.user.id);


    }

 
    render() {
        //console.log(this.props)
        let outcomesList = null
        if (this.props.outcomes.outcomes[0] === undefined) {
            outcomesList = <Spinner animation='border' variant="primary"></Spinner>
        }
        else {
            outcomesList = this.props.outcomes.outcomes.map( (outcome, index) =>
                <li key={index}>{outcome}</li>
            )
        }

        return (
            <Fragment>
                <section className="panel important">
                    <h2> List of Outcomes </h2>
                    <hr />
                    <ol>
                        {outcomesList}
                    </ol>
                </section>
            </Fragment>

        )
    }
}

Outcomes.propTypes = {
    auth: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
    auth: state.auth,
    outcomes: state.outcomes
});

export default connect(
    mapStateToProps,
    { getOutcomes}
)(Outcomes);
