import axios from 'axios'
import {COORDINATOR_ACTIVITY, GET_ERRORS} from './types'

export const getCordActivity = () => dispatch => {

    axios
        .get("/api/logs/coordinatorLogs")
        .then(dispatch(setLogLoading()))
        .then(res => {
            dispatch({
                type: COORDINATOR_ACTIVITY,
                payload: res.data
            })
        }
        )

        .catch(err => dispatch({
            type: GET_ERRORS,
            payload: err.response.data
        })
        )
}

export const setLogLoading = () => {
    return {
        type: 'LOG_LOADING'
    }
}
