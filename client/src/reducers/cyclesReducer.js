import { GET_CYCLES, GET_CYCLES_MEASURES, GET_CYCLES_OUTCOMES } from "../actions/types";

const initialState = {
    cycles: null,
    cycleMeasures: null,
    outcomeMeasures: null
}

export default function (state = initialState, action) {
    switch (action.type) {
        case GET_CYCLES:
            return{
                ...state,
                cycles: action.payload
            }
        case GET_CYCLES_OUTCOMES:
            return{
                ...state,
                cycleMeasures: action.payload
            }
        case GET_CYCLES_MEASURES:
            return {
                ...state,
                outcomeMeasures: action.payload
            }
        default:
            return state;
    }
}