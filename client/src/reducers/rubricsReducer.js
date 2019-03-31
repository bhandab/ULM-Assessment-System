import {CREATE_RUBRIC} from '../actions/types'
const initialState = {
    rubric: {}
}

export default function (state = initialState, action) {

    switch (action.type) {
        case CREATE_RUBRIC:
            console.log("reducer")
            console.log(action.payload)
            return{
            ...state,
            rubric: action.payload
            }
            
    
        default:
            return state;
    }
    
}