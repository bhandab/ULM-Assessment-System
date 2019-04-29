import axios from 'axios';
import {GET_ERRORS, GET_RUBRICS, GET_SINGLE_RUBRIC, LOADING} from './types';
import {toastr} from 'react-redux-toastr'


export const createRubric = (rubricDetails,history) => dispatch => {

    axios
        .post("/api/rubrics/createRubric", rubricDetails)
        .then(res => 
            history.push("/admin/rubrics/"+res.data.rubricDetails.strutureInfo.rubricID)
        )
        .then(() => toastr.success(
            "Rubric Created!",
            `${rubricDetails.rubricName} Successfully Created!!`
        ))
        .then(()=>
            dispatch(getAllRubrics())
        )
        .catch(err=> 
            console.log(err)
        )
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

export const updateCriteriaWeight = (rubricID,body) => dispatch => {
    axios
        .post("/api/rubrics/"+rubricID+"/updateWeight",body)
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

export const updateScaleDescription = (rubricID,body) => dispatch => {
    axios
        .post("/api/rubrics/"+rubricID+"/updateScaleDescription",body)
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

export const deleteRubric = (rubricID) => dispatch => {
    axios
    .post("/api/rubrics/delete",{rubricID})
    .then(() => toastr.success(
        "Rubric Deleted!",
        `Rubric Successfully Deleted!!`
    ))
    .then(()=>
        dispatch(getAllRubrics())
    )
}

export const setRubricsLoading = () => {
    return {
        type: LOADING
    }
}