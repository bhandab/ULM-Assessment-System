import axios from 'axios'
import {EVALUATION_DETAILS} from './types'


export const getEvaluatorDetails = () => dispatch => {
    axios
    .get("/api/evaluations")
    .then(res => dispatch({
        type: EVALUATION_DETAILS,
        payload: res.data
    }))
        .catch(err => dispatch({
            type: EVALUATION_DETAILS,
            payload: []
        })
        )
}