import axios from 'axios';
import { GET_OUTCOMES, GET_ERRORS } from './types';


export const getOutcomes = (adminID) => dispatch => {

    axios
        .get("/api/outcomes",adminID)
        .then(res => {
            dispatch({
                type: GET_OUTCOMES,
                payload: res.data
            })
        }
        )

        .catch(err => dispatch({
            type: GET_OUTCOMES,
            payload: []
        })
        )
}

export const addOutcome = (outcomeDescription, history) => dispatch => {
    axios
        .post("/api/outcomes/createOutcome", outcomeDescription)
        .then(res => history.push("/admin/outcomes"))
        .catch(err =>
            dispatch({
                type: GET_ERRORS,
                payload: err.response.data
            }))
}

