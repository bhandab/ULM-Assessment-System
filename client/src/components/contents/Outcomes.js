import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { getOutcomes, addOutcome } from "../../actions/outcomesAction";
import PropTypes from "prop-types";

class Outcomes extends Component {

    state = {
        outcomeDescription: ""

    }


    componentDidMount() {
        this.props.getOutcomes();


    }

    onChangeHandler(e) {
        e.preventDefault();
        this.setState({ outcomeDescription: e.target.value })

    }

    onSubmitHandler(e) {
        e.preventDefault()
        this.props.addOutcome(this.state, this.props.history)
        window.location.reload()


    }

    render() {
        let outcomesList = null
        if (this.props.outcomes.outcomes[0] === undefined) {
            outcomesList = <h3> Loading Outcomes LIst</h3>
        }
        else {
            outcomesList = this.props.outcomes.outcomes.map(outcome =>
                <li key={outcome.outcomeID}>{outcome.outcomeDescription}</li>
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

                <section className="panel important">
                    <h2>Add Outcomes</h2>
                    <form>
                        <input type="text" name="outcomeDescription" onChange={this.onChangeHandler.bind(this)} placeholder="Enter the outcome" value={this.state.outcome} />
                        <input type="submit" value="Add" onClick={this.onSubmitHandler.bind(this)} />
                    </form>
                </section>

            </Fragment>

        )
    }
}

Outcomes.propTypes = {
    getOutcomes: PropTypes.func.isRequired,
    auth: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
    auth: state.auth,
    outcomes: state.outcomes
});

export default connect(
    mapStateToProps,
    { getOutcomes, addOutcome }
)(Outcomes);
