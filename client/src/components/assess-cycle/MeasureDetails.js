import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import PropTypes from "prop-types";
import { getMeasureDetails, getMeasureEvaluators } from '../../actions/assessmentCycleAction';
import { Jumbotron, Card, Button} from 'react-bootstrap'



class MeasureDetails extends Component {

    state = {
        show: false,
    }

    componentDidMount() {
        if (!this.props.auth.isAuthenticated) {
            this.props.history.push('/login')
        }
        const cycleID = this.props.match.params.cycleID
        const outcomeID = this.props.match.params.outcomeID
        const measureID = this.props.match.params.measureID

        this.props.getMeasureDetails(cycleID, outcomeID, measureID)
        this.props.getMeasureEvaluators(measureID)
    }



    render() {
        console.log(this.props)
        let measureTitle = null
        if (this.props.cycles.loading === false) {
            console.log("Not Loading")
            measureTitle = this.props.cycles.measureDetails.measureDescription
        }

        return (
            <Fragment>
                <section className="panel important">
                    <Jumbotron>
                        <p id="measure-title-label">Measure Title</p>
                        <h4 id="measure-title">{measureTitle}</h4>
                        <hr />

                        <Card style={{ width: '27rem', float:"left",marginLeft:"5px"}}>
                            <Card.Body>
                                <Card.Title>Evaluators</Card.Title>
                                <Card.Text>
                                   Evaluator List
                                </Card.Text>
                                <Button variant="primary">Add Evaluators</Button>
                            </Card.Body>
                        </Card>

                        <Card style={{ width: '27rem' }}>
                            <Card.Body>
                                <Card.Title>Students</Card.Title>
                                <Card.Text>
                                    Student List
                                </Card.Text>
                                <Button variant="primary">Add Students</Button>
                            </Card.Body>
                        </Card>
                    </Jumbotron>
                </section>
            </Fragment>
        )
    }

}

MeasureDetails.propTypes = {
    auth: PropTypes.object.isRequired,
    getMeasureDetails: PropTypes.func.isRequired,
    getMeasureEvaluators: PropTypes.func.isRequired
}

const MapStateToProps = state => ({
    auth: state.auth,
    cycles: state.cycles,
    measureDetails: state.measureDetails,
    measureEvaluators: state.measureEvaluators
})
export default connect(MapStateToProps, { getMeasureDetails, getMeasureEvaluators })(MeasureDetails);