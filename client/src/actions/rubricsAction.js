import axios from 'axios';
import {GET_ERRORS, GET_RUBRICS, GET_SINGLE_RUBRIC, LOADING} from './types';

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

export const getSingleRubric = (rubricID,val) => dispatch => {
    if(val){dispatch(setRubricsLoading())}
    axios
        .get("/api/rubrics/"+rubricID+"/rubricDetails")
        .then(res => {
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

export const updateRubricCriteria = (rubricID,body) => dispatch => {
    axios
        .post("/api/rubrics/"+rubricID+"/updateCriteria",body)
        .then(()=> {
            dispatch(getSingleRubric(rubricID, false))
        })
        .catch(err => {
            dispatch({
                type: GET_ERRORS,
                payload: err.response.data
            })
        })
        
}

export const updateCellDescription = (rubricID, body) => dispatch => {
    axios
        .post("/api/rubrics/" + rubricID + "/updateLevelDescription", body)
        .then(() => {
            dispatch(getSingleRubric(rubricID,false))
        })
        .catch(err => {
            dispatch({
                type: GET_ERRORS,
                payload: err.response.data
            })
        })

}

export const updateCriteriaWeight = (rubricID,criteriaID,body) => dispatch => {
    axios
        .post("/api/rubrics/"+rubricID+"/"+criteriaID+"/updateWeight",body)
        .then(() => {
            dispatch(getSingleRubric(rubricID, false))
        })
        .catch(err => {
            dispatch({
                type: GET_ERRORS,
                payload: err.response.data
            })
        })
} 

export const setRubricsLoading = () => {
    return {
        type: LOADING
    }
}