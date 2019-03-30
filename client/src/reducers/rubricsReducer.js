import {CREATE_RUBRIC} from '../actions/types'
const initialState = {
    rubric: null
}

export default function (state = initialState, action) {

    switch (action.type) {
        case CREATE_RUBRIC:
            return{
            ...state,
            rubric: action.payload
            }
            
    
        default:
            return state;
    }
    
}