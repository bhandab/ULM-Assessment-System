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
    axios
        .post("/api/cycles/createCycle", cycleName)
        .then(() => dispatch(getAssessmentCycles()))
        .catch(err =>
            dispatch({
                type: GET_ERRORS,
                payload: err.response.data
            }))
}

export const linkOutcomeToCycle = (cycleID,outcome,history) => dispatch => {
    axios
        .post("/api/cycles/"+cycleID+"/addNewOutcome",outcome)
        .then((res) => { 
            //console.log(res.data);
            dispatch(getCycleMeasures(cycleID));
        })
        .catch(err =>
            dispatch({
                type: GET_ERRORS,
                payload: err.response.data
            }))
}

export const linkMeasureToOutcome = (cycleID, outcomeID, details) => dispatch => {
    axios
        .post("/api/cycles/" + cycleID + "/" + outcomeID +"/addNewMeasure",details)
        .then(()=>{
            dispatch(getOutcomesMeasures(cycleID, outcomeID));
        })
        .catch(err =>
            dispatch({
                type: GET_ERRORS,
                payload: err.response.data
            }))
}

export const getCycleMeasures = (cycleID) => dispatch => { //outcomes of a cycle
    axios
    .get("/api/cycles/"+cycleID+"/outcomes")
    .then(res => {
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

export const getOutcomesMeasures = (cycleID, outcomeID) => dispatch => { //measures of outcomes
    console.log(cycleID+outcomeID)
    axios
        .get("/api/cycles/" + cycleID+"/"+outcomeID+"/measures")
        .then(res => {
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