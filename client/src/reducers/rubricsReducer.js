import {CREATE_RUBRIC, GET_RUBRICS} from '../actions/types'
const initialState = {
    rubric: {},
    rubrics: {}
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
        case GET_RUBRICS:
            return {
                ...state,
                rubrics: action.payload
            }
    
        default:
            return state;
    }
    
}