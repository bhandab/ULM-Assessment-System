import axios from 'axios'
import { EVALUATION_RUBRICS, EVALUATION_DETAILS, RUBRIC_SCORES, GET_ERRORS} from './types'

export const getEvaluatorDetails = () => dispatch => {
    console.log("Gets in details")
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
    .get("/api/evaluations/evaluationRubrics")
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
    console.log(body)
    axios
    .post("/api/evaluations/evaluate",body)
    .then(res => dispatch({
        type: RUBRIC_SCORES,
        payload: res.data
    }))       
     .catch(err => dispatch({
            type: GET_ERRORS,
            payload: err.response.data
        })
        )
}

export const updateRubricScores = (body) => dispatch => {
    console.log(body)
    axios
    .post("/api/evaluations/updateScores",body)
        .catch(err => dispatch({
            type: GET_ERRORS,
            payload: err.response.data
        })
        )
}
