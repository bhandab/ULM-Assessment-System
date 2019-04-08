import axios from 'axios';
import {
    GET_ERRORS,
    GET_CYCLES,
    GET_CYCLES_MEASURES,
    GET_MEASURE_EVALUATORS,
    GET_CYCLES_OUTCOMES,
    GET_MEASURE_DETAILS,
    CYCLE_LOADING
}
    from './types';

export const getAssessmentCycles = () => dispatch => {
    //dispatch(setLoading())
    axios
        .get("/api/cycles")
        .then(res => {
            dispatch({
                type: GET_CYCLES,
                payload: res.data
            })
        })

        .catch(err => dispatch({
            type: GET_CYCLES,
            payload: err.response.data
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

export const linkOutcomeToCycle = (cycleID, outcome, history) => dispatch => {
    axios
        .post("/api/cycles/" + cycleID + "/addNewOutcome", outcome)
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
    console.log(details)
    axios
        .post("/api/cycles/" + cycleID + "/" + outcomeID + "/addNewMeasure", details)
        .then(() => {
            dispatch(getOutcomesMeasures(cycleID, outcomeID));
        })
        .catch(err =>
            dispatch({
                type: GET_ERRORS,
                payload: err.response.data
            }))
}

export const getCycleMeasures = (cycleID) => dispatch => { //outcomes of a cycle
    //dispatch(setLoading())
    axios
        .get("/api/cycles/" + cycleID + "/outcomes")
        .then(res => {
            dispatch({
                type: GET_CYCLES_OUTCOMES,
                payload: res.data
            })
        })
        .catch(err => {
            console.log(err)
            dispatch({
                type: GET_ERRORS,
                payload: err.response.data

            }
            )
        })
}

export const getOutcomesMeasures = (cycleID, outcomeID) => dispatch => { //measures of outcomes
    dispatch(setLoading())
    //console.log(cycleID+outcomeID)
    axios
        .get("/api/cycles/" + cycleID + "/" + outcomeID + "/measures")
        .then(res => {
            dispatch({
                type: GET_CYCLES_MEASURES,
                payload: res.data
            })
        })
        .catch(err => {
            console.log(err)
            dispatch({
                type: GET_ERRORS,
                payload: err.response.data

            }
            )
        })
}

//export const getMeasureDetails = ()

export const updateCycleName = (cycleID, body) => dispatch => {
    axios
        .post("/api/cycles/" + cycleID + "/update", body)
        .then(() => dispatch(getAssessmentCycles()))
        .catch(err => {
            console.log(err)
            dispatch({
                type: GET_ERRORS,
                payload: err.response.data

            }
            )
        })
}

export const deleteCycle = (cycleID) => dispatch => {
    axios
        .post("/api/cycles/" + cycleID + "/delete")
        .then(() => dispatch(getAssessmentCycles()))
        .catch(err => {
            console.log(err)
            dispatch({
                type: GET_ERRORS,
                payload: err.response.data

            }
            )
        })


}

export const updateOutcomeName = (cycleID, outcomeID, body) => dispatch => {
    axios
        .post("/api/cycles/" + cycleID + "/" + outcomeID + "/update", body)
        .then(() => dispatch(getCycleMeasures(cycleID)))
        .catch(err => {
            console.log(err)
            dispatch({
                type: GET_ERRORS,
                payload: err.response.data

            }
            )
        })
}

export const deleteOutcome = (cycleID, outcomeID) => dispatch => {
    axios
        .post("/api/cycles/" + cycleID + "/" + outcomeID + "/delete")
        .then(() => dispatch(getCycleMeasures(cycleID)))
        .catch(err => {
            console.log(err)
            dispatch({
                type: GET_ERRORS,
                payload: err.response.data

            }
            )
        })
}

export const getMeasureDetails = (cycleID, outcomeID, measureID) => dispatch => {
    //dispatch(setLoading())
    axios
        .get("/api/cycles/" + cycleID + "/" + outcomeID + "/" + measureID + "/measureDetails")
        .then(res => {
            dispatch({
                type: GET_MEASURE_DETAILS,
                payload: res.data
            })
        })
        .catch(err => {
            dispatch({
                type: GET_ERRORS,
                payload: err.response.data

            }
            )
        })
}

export const getMeasureEvaluators = (measureID) => dispatch => {
    //dispatch(setLoading())
    axios
        .get("/api/cycles/" + measureID + "/measureEvaluators")
        .then(res => {
            dispatch({
                type: GET_MEASURE_EVALUATORS,
                payload: res.data
            })
        })
        .catch(err => {
            dispatch({
                type: GET_ERRORS,
                payload: err.response.data

            }
            )
        })

}

export const addEvaluator = (measureID, body) => dispatch => {
    axios
        .post("/api/cycles/" + measureID + "/addEvaluator", body)
        .then(dispatch(getMeasureEvaluators(measureID)))
        .catch(err => {
            dispatch({
                type: GET_ERRORS,
                payload: err.response.data

            }
            )
        })
}

export const setLoading = () => {
    return {
        type: CYCLE_LOADING
    }
}

