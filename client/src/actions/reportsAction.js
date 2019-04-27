import {CYCLE_REPORT, GET_ERRORS} from './types'
import axios from 'axios'

export const getCycleReport = (cycleID) => dispatch => {
    axios
        .get("/api/cycles/"+cycleID+"/cycleSummaryReport")
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

