import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { getMeasures } from "../../actions/measuresAction";
import PropTypes from "prop-types";
import {Spinner} from 'react-bootstrap';

class Measures extends Component {

    state = {
        addEval: false,
        addStud: false
    }

    componentDidMount = () => {
        if (!this.props.auth.isAuthenticated || this.props.auth.user.role !== "coordinator"){
            this.props.history.push('/login')
        }

        this.props.getMeasures();

    }


    render() {

        let measuresList = <Spinner animation='border' variant="primary"></Spinner>

        if (this.props.measures.measures === null ) {
            measuresList = <Spinner animation='border' variant="primary"></Spinner>
        }

        else {
            if(this.props.measures.measures.length === 0){
                measuresList = <li className="list-group-item">No Measures Present</li>
            }
            else {
            measuresList = this.props.measures.measures.map((measure, index) =>
                <li className="list-group-item" key={index}>{measure.measureDescription}</li>
            )
            }
        }

        return (
            <Fragment>
                <section className="panel important border border-info rounded p-3">
                    <h2> List of Performance Measures </h2>
                    <hr />
                    <ol className="list-group">
                        {measuresList}
                    </ol>
                </section>

            </Fragment>

        )
    }
}

Measures.propTypes = {
    getMeasures: PropTypes.func.isRequired,
    auth: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
    auth: state.auth,
    measures: state.measures,
    errors: state.errors
});

export default connect(
    mapStateToProps,
    { getMeasures}
)(Measures);
