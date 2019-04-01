import axios from 'axios';
import {CREATE_RUBRIC, GET_ERRORS, GET_RUBRICS} from './types';

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
        .then(()=> {
            dispatch(getAllRubrics(cycleID, outcomeID, measureID))
        }

        )

        .catch(err=> {
            dispatch({
                type: GET_ERRORS,
                payload: err.response.data
            })
        })
}

export const getAllRubrics = (cycleID, outcomeID, measureID) => dispatch => {

    axios
        .get("/api/cycles/" + cycleID + "/" + outcomeID + "/" + measureID + "/rubrics")
        .then(res => {
            dispatch({
                type: GET_RUBRICS,
                payload: res.data
            })
        })

        .catch(err => {
            dispatch({
                type: GET_ERRORS,
                payload: err.response.data
            })
        })
}