import { GET_ERRORS, GET_REGISTERED_EVALUATORS } from './types'
import axios from 'axios'

export const inviteEvaluator = (email) => dispatch => {
    axios
        .post("/api/evaluators/invite", email)
        .catch(err => {
            dispatch({
                type: GET_ERRORS,
                payload: err.response.data

            }
            )
        })
}

export const getRegisteredEvaluators = () => dispatch => {
    axios
        .get("/api/evaluators")
        .then(res => {
            console.log(res)
            dispatch({
                type: GET_REGISTERED_EVALUATORS,
                payload: res.data
            })
        })
        .catch(err => {
            dispatch({
                type: GET_ERRORS,
                payload: err.response.data

            }
            )
        })
}