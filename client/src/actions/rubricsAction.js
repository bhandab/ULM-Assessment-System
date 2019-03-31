import axios from 'axios';
import {CREATE_RUBRIC, GET_ERRORS} from './types';

export const createRubric = (cycleID,outcomeID,measureID,rubricDetails) => dispatch => {

    axios
        .post("/api/cycles/" + cycleID+"/"+outcomeID+"/"+measureID+"/addNewRubric", rubricDetails)
        .then(res => {
            console.log(res)
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