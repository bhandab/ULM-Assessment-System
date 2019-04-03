import axios from 'axios';
import {GET_ERRORS, GET_RUBRICS, GET_SINGLE_RUBRIC} from './types';

export const createRubric = (rubricDetails) => dispatch => {

    axios
        .post("/api/rubrics/createRubric", rubricDetails)
        .then(()=> {
            dispatch(getAllRubrics())
        })

        .catch(err=> {
            dispatch({
                type: GET_ERRORS,
                payload: err.response.data
            })
        })
}

export const getAllRubrics = () => dispatch => {
    axios
        .get("/api/rubrics")
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

export const getSingleRubric = (rubricID) => dispatch => {

    axios
        .get("/api/rubrics/"+rubricID+"/rubricDetails")
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

/*export const getRubricsGlobal = () => dispatch => {
    axios
    
    .get("/api/rubrics")
    
    .then(res => {
       // console.log(res)
        dispatch({
            type: GET_RUBRICS_GLOBAL,
            payload: res.data
        })
    })
        .catch(err => {
            dispatch({
                type: GET_ERRORS,
                payload: err.response.data
            })
        })
}*/