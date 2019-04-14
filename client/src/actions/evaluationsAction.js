import axios from 'axios'
import {} from './types'


export const evaluatorDetails = () => dispatch => {
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