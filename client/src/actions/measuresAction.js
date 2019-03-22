import axios from 'axios';
import { GET_MEASURES } from './types';


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