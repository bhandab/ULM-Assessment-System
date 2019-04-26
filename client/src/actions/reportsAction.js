import {CYCLE_REPORT, OUTCOME_REPORT,GET_ERRORS} from './types'
import axios from 'axios'

export const getCycleReport = () => dispatch => {
    axios
        .get("")
        .then(res => {
            dispatch({
                type: CYCLE_REPORT,
                payload: res.data
            })
        })

        .catch(err => dispatch({
            type: GET_ERRORS,
            payload: err.response.data
        }))
}

export const getOutcomeReport = () => dispatch => {
    axios
    .get("")
    .then(res => {
        dispatch({
            type: OUTCOME_REPORT,
            payload: res.data
        })
    })

    .catch(err => dispatch({
        type: GET_ERRORS,
        payload: err.response.data
    }))
}