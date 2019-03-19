import { GET_OUTCOMES } from "../actions/types";

const initialState = {
    outcomes: null
}

export default function (state = initialState, action) {
    
    switch (action.type) {
        case GET_OUTCOMES:
            console.log(action.payload)
            return {
                ...state,
                outcomes: "Angel"
            }
    
        default:
            return state
    }
    
}