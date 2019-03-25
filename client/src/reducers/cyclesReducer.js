import { GET_CYCLES, GET_CYCLES_MEASURES } from "../actions/types";

const initialState = {
    cycles: null,
    cycleMeasures: null
}

export default function (state = initialState, action) {
    switch (action.type) {
        case GET_CYCLES:
            return{
                ...state,
                cycles: action.payload
            }
        case GET_CYCLES_MEASURES:
            return{
                ...state,
                cycleMeasures: action.payload
            }
    
        default:
            return state;
    }
}