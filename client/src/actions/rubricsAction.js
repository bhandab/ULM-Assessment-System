import axios from 'axios';
import {CREATE_RUBRIC, GET_ERRORS} from './types';

export const createRubric = (rubricDetails) => dispatch => {

    axios
        .post("/api/rubric/createRubric", rubricDetails)
        .then(res => {
            dispatch({
                type: CREATE_RUBRIC,
                payload: res.data
            })
        })

        .catch(err=> {
            dispatch({
                type: GET_ERRORS,
                payload: err.response.data
            })
        })
}