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

        if (this.props.measures.measures === null ) {
            measuresList = <h3> Loading Measures List</h3>
        }

        else {
            if(this.props.measures.measures.length === 0){
                measuresList = <p>No Measures Present</p>
            }
            else {
            measuresList = this.props.measures.measures.map((measure, index) =>
                <li key={index}>{measure.measureName}</li>
            )
            }
        }

        return (
            <Fragment>
                <section className="panel important">
                    <h2> List of Performance Measures </h2>
                    <hr />
                    <ol>
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
