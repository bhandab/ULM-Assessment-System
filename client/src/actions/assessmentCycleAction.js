import axios from 'axios';
import {GET_ERRORS, GET_CYCLES, GET_CYCLES_MEASURES, GET_CYCLES_OUTCOMES} from './types';

export const getAssessmentCycles = () => dispatch => {
    axios
        .get("/api/cycles")
        .then( res => {
            dispatch({
                type: GET_CYCLES,
                payload:res.data
            })
        })

        .catch(err => dispatch({
            type: GET_CYCLES,
            payload: []
        }))
}

export const createCycle = (cycleName, history) => dispatch => {
   // console.log(history)
    axios
        .post("/api/cycles/createCycle", cycleName)
        .then(() => history.push("/admin/cycles"))
        .catch(err =>
            dispatch({
                type: GET_ERRORS,
                payload: err.response.data
            }))
}

export const linkOutcomeToCycle = (cycleID, outcomeID, history) => dispatch => {
    // console.log(history)
    axios
        .post("/api/cycles/"+cycleID+"/"+outcomeID)
        //.then(() => history.push("/admin/cycles"))
        .catch(err =>
            dispatch({
                type: GET_ERRORS,
                payload: err.response.data
            }))
}

export const getCycleMeasures = (location) => dispatch => { //outcomes of a cycle
    //console.log(location)
    axios
    .get("/api/cycles/"+location)
    .then(res => {
        //console.log(res.data)
        dispatch({
            type: GET_CYCLES_OUTCOMES,
            payload: res.data
        })
    })
    .catch (err =>  {
        console.log(err)
        dispatch({
            type: GET_CYCLES_OUTCOMES,
            payload: []

    }
    )})
}

export const getOutcomesMeasures = (cycleID, outcomeID) => dispatch => { //outcomes of a cycle
    console.log(cycleID,outcomeID)
    axios
        .get("/api/cycles/" + cycleID+"/"+outcomeID)
        .then(res => {
            //console.log(res.data)
            dispatch({
                type: GET_CYCLES_MEASURES,
                payload: res.data
            })
        })
        .catch(err => {
            console.log(err)
            dispatch({
                type: GET_CYCLES_MEASURES,
                payload: []

            }
            )
        })
}