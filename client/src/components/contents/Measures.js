import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { getMeasures } from "../../actions/measuresAction";
import PropTypes from "prop-types";

class Measures extends Component {


    componentDidMount = () => {
        this.props.getMeasures();
    }


    render() {
        let measuresList = null
        console.log(this.props)
        /*if (this.props.measures.measures[0] === undefined) {
            measuresList = <h3> Loading Measures List</h3>
        }
        else {
            measuresList = this.props.measures.measures.map(measure =>
                <li key={measure.measureID}>{measure.measureDescription}</li>
            )
        }*/

        return (
            <Fragment>
                <section className="panel important">
                    <h2> List of Performance Measures </h2>
                    <hr />
                    <ol>
                        {measuresList}
                    </ol>
                </section>

                <section className="panel important">
                    <h2>Add Performance Measures</h2>
                    <form>
                        <input type="text" name="outcome" placeholder="Enter the measure" />
                        <button type="submit" onClick={(e) => this.onSubmitHandler(e)}>Add</button>
                    </form>
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
    measures: state.measures
});

export default connect(
    mapStateToProps,
    { getMeasures }
)(Measures);
