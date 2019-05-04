import { GET_ERRORS, GET_REGISTERED_EVALUATORS, GET_INVITED_EVALUATORS } from './types'
import axios from 'axios'
import {toastr} from 'react-redux-toastr'

export const inviteEvaluator = (email) => dispatch => {
    axios
        .post("/api/evaluators/invite", email)
        .then(() => toastr.success(
            "Evaluator Invited!",
            "Measure Evaluator Successfully Invited!"
        ))
        .then(() => dispatch(getInvitedEvaluators()))
        .catch(err => {
            dispatch({
                type: GET_ERRORS,
                payload: err.response.data

            }
            )
        })
}

export const deleteEvaluator = (evalID) => dispatch => {
    axios
        .post("/api/evaluators/deleteEvaluator", {evalID})
        .then(() => toastr.success(
            "Evaluator Deleted!",
            "Evaluator Successfully Deleted!"
        ))
        .then(() => dispatch(getRegisteredEvaluators()))
        .catch(err => {
            dispatch({
                type: GET_ERRORS,
                payload: err.response.data

            }
            )
        })
}

export const unInviteEvaluator = (email) => dispatch => {
    axios
        .post("/api/evaluators/deleteInvitedEvaluator", {evalEmail:email})
        .then(() => toastr.success(
            "Evaluator Invitation Cancelled!",
            "Measure Evaluator Invitation Successfully Cancelled!"
        ))
        .then(() => dispatch(getInvitedEvaluators()))
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

export const getInvitedEvaluators = () => dispatch => {
    axios
        .get("/api/evaluators/invitedEvaluators")
        .then(res => {
            dispatch({
                type: GET_INVITED_EVALUATORS,
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