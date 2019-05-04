import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { getMeasures } from "../../actions/measuresAction";
import PropTypes from "prop-types";
import {Spinner, ListGroup, Card, Button} from 'react-bootstrap';

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
                measuresList = <ListGroup.Item >No Measures Present</ListGroup.Item>
            }
            else {
            measuresList = this.props.measures.measures.map((measure, index) =>
                <ListGroup.Item  key={index}>{index+1}. {measure.measureDescription}</ListGroup.Item>
            )
            }
        }

        return (
            <Fragment>
                <section className="panel important border border-info rounded p-3">
                <Card>
                    <Card.Header> <h2> List of Performance Measures  
                    <Button variant="danger" className="float-right" onClick={()=>this.props.history.goBack()}><i className="fas fa-times"></i></Button>
                    </h2>
                    </Card.Header>
                    <Card.Body>
                    <ListGroup>
                        {measuresList}
                    </ListGroup>
                   </Card.Body>
                   </Card>

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
