import React, {Component} from 'react';
import {connect} from 'react-redux';
import {getEvaluatorDetails} from '../../actions/evaluationsAction';
import PropTypes from 'prop-types';
import { ListGroup, Card } from "react-bootstrap";



class Evaluate extends Component {

    componentDidMount(){
        this.props.getEvaluatorDetails()
    }


    onClickListener = e => {
        console.log("Clicked!!!!")
    }
    render(){
        let studentList = []
        if (this.props.evaluations.evaluationDetails !== null) {
            studentList = this.props.evaluations.evaluationDetails.map( (student, index) => {
                return(
                    <ListGroup.Item className="list-group-item" value={index}>{student.studentName} | {student.rubricName}</ListGroup.Item>
                )
            })
        }

        console.log(this.props)
        return(
            <section className="panel important">
            <p>Evaluator</p>
            <Card className="row">
            <ListGroup className="students col-3">{studentList}</ListGroup>
            </Card>
            </section>
        )
    }
}

Evaluate.propTypes = {
    auth: PropTypes.object.isRequired,
    getEvaluatorDetails: PropTypes.func.isRequired
}

const MapStateToProps = state => ({
    auth: state.auth,
    evaluatorDetails: state.evaluatorDetails,
    evaluations: state.evaluations
})

export default connect (MapStateToProps, 
    {
        getEvaluatorDetails
    })(Evaluate)