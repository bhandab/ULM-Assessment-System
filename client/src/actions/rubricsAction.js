import axios from 'axios';
import {CREATE_RUBRIC, GET_ERRORS, GET_RUBRICS, GET_SINGLE_RUBRIC} from './types';

export const createRubric = (cycleID,outcomeID,rubricDetails) => dispatch => {

    axios
        .post("/api/cycles/" + cycleID+"/"+outcomeID+ "/addNewRubric", rubricDetails)
        /*.then(res => {
           // console.log(res)
            dispatch({
                type: CREATE_RUBRIC,
                payload: res.data
            })
        })*/
        .then(()=> {
            dispatch(getAllRubrics(cycleID, outcomeID))
        })

        .catch(err=> {
            dispatch({
                type: GET_ERRORS,
                payload: err.response.data
            })
        })
}

export const getAllRubrics = (cycleID, outcomeID) => dispatch => {
    axios
        .get("/api/cycles/" + cycleID + "/" + outcomeID + "/rubrics")
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

export const getSingleRubric = (cycleID, outcomeID, rubricID) => dispatch => {

    axios
        .get("/api/cycles/"+cycleID+"/"+outcomeID+"/"+rubricID+"/rubricDetails")
        .then(res => {
            console.log(res.data)
            dispatch({
                type: GET_SINGLE_RUBRIC,
                payload: res.data
            })
        })

        .catch (err => {
            dispatch({
                type: GET_ERRORS,
                payload: err.response.data
            })
        })
}