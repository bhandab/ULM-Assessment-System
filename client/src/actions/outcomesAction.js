import axios from 'axios';
import { GET_OUTCOMES, GET_ERRORS } from './types';


export const getOutcomes = () => dispatch => {

    axios
        .get("/api/outcomes/learningOutcomes")
        .then(res => {
            //console.log(res.data);
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

export const addOutcome = (outcome, history) => dispatch => {
    axios
        .post("/api/outcomes/createOutcome", outcome)
        .then(res => history.push("/admin/outcomes"))
        .catch(err =>
            dispatch({
                type: GET_ERRORS,
                payload: err.response.data
            }))
}

