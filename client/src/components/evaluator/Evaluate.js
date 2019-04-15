import React, {Component} from 'react';
import {connect} from 'react-redux';
import {getEvaluatorDetails} from '../../actions/evaluationsAction';
import PropTypes from 'prop-types';
import { ListGroup, Card } from "react-bootstrap";



class Evaluate extends Component {

    state = {
        rubric : "Select A Student",
        stud: ""
    }

    componentDidMount(){
        this.props.getEvaluatorDetails()
    }


    onClickListener = e => {
        const index = e.target.dataset.idx
        let student = this.props.evaluations.evaluationDetails[index]


    }
    render(){
    //     let studentList = []
    //     let studSet = new Set()
    //    /* if (this.props.evaluations.evaluationDetails !== null) {
    //         const studentArray = this.props.evaluations.evaluationDetails
    //         /*studentList =*/ studentArray .map( (student, index) => {
    //             if(!studSet.has(student.rubricName)){
    //                 studSet.add(student.rubricName)
    //             }
    //             /*return(
    //                 <ListGroup.Item className="list-group-item" key={index} data-idx={index} onClick={(e)=>this.onClickListener(e)}>{student.studentName} | {student.rubricName}</ListGroup.Item>
    //             )*/
    //             //studentArray.
    //         })
    //     }
    //     console.log(studSet)

        console.log(this.props)
        return(
            <section className="panel important">
            <p>Evaluator</p>
            <Card className="row">
            <ListGroup className="students col-3">studentList</ListGroup>
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