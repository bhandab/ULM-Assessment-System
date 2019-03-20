import axios from 'axios';
import { GET_OUTCOMES } from './types';


export const getOutcomes = () => dispatch => {

    console.log("gets here")
    
    axios
    .get("api/outcomes/learningOutcomes")
    .then(res => dispatch({
        type: GET_OUTCOMES,
        payload: res.data
        
    })
    )

    .catch(err => dispatch({
        type: GET_OUTCOMES,
        payload: []
    })
    
    )

    
} 