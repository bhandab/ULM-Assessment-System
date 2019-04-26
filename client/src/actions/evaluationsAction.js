import axios from 'axios'
import { EVALUATION_RUBRICS, EVALUATION_DETAILS, RUBRIC_SCORES, GET_ERRORS,TEST_SCORES} from './types'

export const getEvaluatorDetails = () => dispatch => {
    axios
        .get("/api/evaluations")
        .then(res => dispatch({
            type: EVALUATION_DETAILS,
            payload: res.data
        }))
        .catch(err => dispatch({
            type: GET_ERRORS,
            payload: err.response.data
        })
        )
}

export const getEvaluationRubrics = () => dispatch => {
    axios
    .get("/api/evaluations/evaluationTools")
    .then(res => dispatch({
        type: EVALUATION_RUBRICS,
        payload: res.data
    }))
        .catch(err => dispatch({
            type: GET_ERRORS,
            payload: err.response.data
        })
        )
}

export const submitRubricScores = (body) => dispatch => {
    axios
    .post("/api/evaluations/evaluate",body)
    .then(res => dispatch({
        type: RUBRIC_SCORES,
        payload: res.data
    }))       
     .catch(err => dispatch({
            type: GET_ERRORS,
            payload: err.response.data
    }))
}

export const updateRubricScores = (body) => dispatch => {
    const newBody = {
    rubricID:body.rubricID,
     measureID:body.measureID,
     studentID:body.studentID,
     measureEvalID:body.measureEvalID
    }
    axios
    .post("/api/evaluations/updateScores",body)
        .catch(err => dispatch({
            type: GET_ERRORS,
            payload: err.response.data
        }))
    .then(dispatch(submitRubricScores(newBody)))
    .catch(err => dispatch({
        type: GET_ERRORS,
        payload: err.response.data
    }))
}

export const testScores = (body) => dispatch =>{
    axios
    .post("/api/evaluations/testScores",body)
    .then(res => dispatch({
        type: TEST_SCORES,
        payload: res.data
    })) 
    .catch(err => dispatch({
        type: GET_ERRORS,
        payload: err.response.data
    }))
}

export const updateTestScores = (testID,body) => dispatch =>{
    axios
    .post("/api/evaluations/updateTestScore",body)
    .then(dispatch(testScores({testID})))
    .catch(err => {
        dispatch({
            type: GET_ERRORS,
            payload: err.response.data

        })
    })
}
