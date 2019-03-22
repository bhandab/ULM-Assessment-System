import axios from 'axios';
import { GET_MEASURES, GET_ERRORS } from './types';


export const getMeasures = () => dispatch => {

    axios
        .get("/api/measures")
        .then(res => {
            dispatch({
                type: GET_MEASURES,
                payload: res.data
            })
        }
        )

        .catch(err => dispatch({
            type: GET_MEASURES,
            payload: []
        })
        )
} 

export const addMeasure = (measureDescription, history) => dispatch => {
    console.log(history)
    axios
        .post("/api/measures/createMeasure", measureDescription)
        .then(res => history.push("/admin/measures"))
        .catch(err =>
            dispatch({
                type: GET_ERRORS,
                payload: err.response.data
            }))
}

