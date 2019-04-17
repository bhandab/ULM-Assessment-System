import React, {Component} from 'react';
import {connect} from 'react-redux';
import { getEvaluationRubrics, getEvaluatorDetails, submitRubricScores} from '../../actions/evaluationsAction';
import {getSingleRubric} from '../../actions/rubricsAction'
import PropTypes from 'prop-types';
import { ListGroup, Card, Form, Button } from "react-bootstrap";



class Evaluate extends Component {

    state = {
       measureID:'',
       studentID:'',
       measureEvalID:''
    }

    componentDidMount(){
        this.props.getEvaluatorDetails()
        this.props.getEvaluationRubrics()
        
    }

       

    onClickListener = e => {
        const index = e.target.dataset.idx
        this.props.getSingleRubric(index, true)
        this.setState({measureID:e.target.dataset.measureid,
            studentID:e.target.dataset.studentid,
            measureEvalID:e.target.dataset.measureeval})
    }
    

    getStudents = (index,name) => {
        let students = []
    if(this.props.evaluations.evaluationDetails !== null & this.props.evaluations.evaluationDetails !== undefined){
        students = this.props.evaluations.evaluationDetails.map( (student,studentIndex)=>{
            if(name === student.rubricName){
            return (
                <ListGroup.Item className="students" 
                onClick = {this.onClickListener.bind(this)}
                data-idx = {student.rubricID}
                data-measureid = {student.measureID}
                data-studentid = {student.studentID}
                data-measureeval={student.measureEvalID}
                key={student.studentID}>{student.studentName}</ListGroup.Item>
            )
            }
            else{
                return null
            }
        })
    }
        return students
    }

    render(){
        let rubrics = []
        let rubricTable = null
        let scoreMap = new Map()

        if (this.props.evaluations.evaluationRubrics !== null) {
            rubrics = this.props.evaluations.evaluationRubrics.map( (rubric, index) => {
                return(
                    <div className="card" key={index}>
                        <div className="card-header" id={"rubric"+index}>
                            <h5 className="mb-0">
                                <button className="btn btn-link" type="button" data-toggle="collapse" data-target={"#collapse"+index} aria-expanded="true" aria-controls={"collapse"+index}>
                                    {rubric.rubricName}
                                </button>
                            </h5>
                        </div>
                        <div id={"collapse"+index} className="collapse" aria-labelledby={"heading"+index} data-parent="#assignedRubric">
                            <div className="card-body">
                                <ListGroup>
                                    {this.getStudents(index,rubric.rubricName)}
                                </ListGroup>
                            </div>
                            
                        </div>
                    </div>
                )
            })
        }

        
       const createRubric = (rubricDetails) => {
            let tableHeader = [];
            let table = [];
            let rubricTitle = null;
            //let scoreMap = new Map()
            console.log(rubricDetails)

            // if (isEmpty(this.props.rubric.singleRubric) === false) {

            const weighted = rubricDetails.structureInfo.weighted

            //const rubricDetails = this.props.rubric.singleRubric.rubricDetails;
            rubricTitle = rubricDetails.structureInfo.rubricTitle;

            tableHeader.push(
                <th key="row1col1">
                    <div>Criteria</div>
                </th>
            );

            for (let i = 0; i < rubricDetails.scaleInfo.length; i++) {
                tableHeader.push(
                    <th key={"row1col" + (i + 2)}>
                        <div>{rubricDetails.scaleInfo[i].scaleValue}</div>
                    </th>
                );
            }
            if (weighted === 1) {
                tableHeader.push(<th className="weight" key={"row1col" + (rubricDetails.scaleInfo.length + 2)}><div>Weight</div></th>)
            }
           // tableHeader.push(<th key="score"><div>Score</div></th>)
            tableHeader = <tr key={"row" + 1}>{tableHeader}</tr>;
            table.push(tableHeader);

            const tableRows = this.props.rubric.singleRubric.rubricDetails.table;
            for (let j = 0; j < tableRows.length; j++) {
                let cells = [];
                cells.push(
                    <td key={"row" + (j + 2) + "col1"}>
                        {rubricDetails.criteriaInfo[j].criteriaDescription}
                    </td>
                );

                const tableCols = tableRows[j];
                for (let k = 0; k < tableCols.length; k++) {
                    cells.push(
                        <td onClick={(e) => scoreClick(e)}
                            key={"row" + (j + 2) + "col" + (k + 2)}
                            data-criteriaid={tableCols[k].criteriaID}
                            data-scaleid={tableCols[k].scaleID}
                            >
                           >{tableCols[k].cellDescription}
                        </td>
                    );
                }

                if (weighted === 1) {
                    cells.push(
                        <td key={"wei" + rubricDetails.criteriaInfo[j].criteriaID}>
                            {rubricDetails.criteriaInfo[j].criteriaWeight}
                        </td>
                    )
                }
                const criteriaID = tableCols[0].criteriaID
                //cells.push(<td key={"score" + j + 2}><Form.Control defaultValue="0" data-critetia={criteriaID} /></td>)
                cells = <tr key={"row" + (j + 2)}>{cells}</tr>;
                table.push(cells);
            }
            table = (
                <div>
                <table className="table table-bordered" id="scoreRubric">
                    <tbody>{table}</tbody>
                </table>
                    <Button onClick={()=>submitScores()}className="float-right">Submit Score</Button>
                </div>
            );
            return table
            //    this.setState({rubric:table})
        }
        if(!this.props.rubric.loading){
            const rubricDetails = this.props.rubric.singleRubric.rubricDetails
            rubricTable = createRubric(rubricDetails)
        }

      const  scoreClick = e => {
            e.target.style.background ="#1eb6a7"
            const selectedCriteria = e.target.dataset.criteriaid
            console.log(e.target.dataset.criteriaid)
            const selectedScale = e.target.dataset.scaleid
            console.log(e.target.dataset.scaleid)
            const scaleInfo = this.props.rubric.singleRubric.rubricDetails.scaleInfo.find(item => {
                return item.scaleID == selectedScale
            })
            const score = scaleInfo.scaleValue
            //console.log(scaleInfo)
            console.log(score)
            scoreMap.set(selectedCriteria, score)
        }

        const submitScores = () =>{
            console.log(scoreMap)
            const keys = []
            const scores = []
            scoreMap.forEach((value,key) => {
                keys.push(key)
            })
            keys.sort().forEach(item=>{
                scores.push({criteriaScore:scoreMap.get(item),criteriaID:item})
            })
            console.log(scores)

            const body = {
                rubricID: this.props.rubric.singleRubric.rubricDetails.structureInfo.rubricID,
                measureID: this.state.measureID+"",
                studentID: this.state.studentID+"",
                measureEvalID: this.state.measureEvalID,
                criteriaScores: scores
            }
            if (scores.length == this.props.rubric.singleRubric.rubricDetails.structureInfo.noOfRows){
            this.props.submitRubricScores(body)
            scoreMap = new Map ()
            window.alert("Student successfully graded!")
            }
            else{
                window.alert("All criterias of the rubric must be scored!")
            }
            
        } 

        console.log(scoreMap)
        console.log(this.props)

        return(
            <section className="panel important">
            
            <Card id="rubricStudent">
                <Card.Header className="row">
                    <h3 className="col-3">Assigned rubrics</h3>
                </Card.Header>
                <Card.Body className="row">
                    <div className="accordion col-2" id="assignedRubric">
                    {rubrics}
                    </div>
                    <div className="col-10">
                    {rubricTable}
                    </div>
                    
                </Card.Body>
            </Card>
                
            </section>
        )
    }
}

Evaluate.propTypes = {
    auth: PropTypes.object.isRequired,
    getEvaluationRubrics: PropTypes.func.isRequired,
    getEvaluatorDetails: PropTypes.func.isRequired,
    getSingleRubric: PropTypes.func.isRequired,
    submitRubricScores: PropTypes.func.isRequired
}

const MapStateToProps = state => ({
    auth: state.auth,
    evaluationRubrics: state.evaluationRubrics,
    evaluationDetails: state.evaluationDetails,
    evaluations: state.evaluations,
    errors: state.errors,
    rubric: state.rubric
})

export default connect (MapStateToProps, 
    {
        getEvaluationRubrics,
        getEvaluatorDetails,
        getSingleRubric,
        submitRubricScores
    })(Evaluate)