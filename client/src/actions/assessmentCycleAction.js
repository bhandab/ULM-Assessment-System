import axios from 'axios';
import {GET_CYCLES, GET_MEASURES} from './types';

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

export const getCycleMeasures = (location) => dispatch => {

    axios
    .get("/api/cycles/"+location)
    .then(res => {
        dispatch({
            type: GET_MEASURES,
            payload: res.data
        })
    })

    .catch (err => dispatch({
        type: GET_MEASURES,
        payload: []
    }))
}