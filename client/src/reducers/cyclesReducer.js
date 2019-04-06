import { GET_CYCLES,
    GET_CYCLES_MEASURES,
    GET_CYCLES_OUTCOMES,
    GET_MEASURE_DETAILS,
    LOADING,
    GET_MEASURE_EVALUATORS}
    from "../actions/types";

const initialState = {
    cycles: null,
    cycleMeasures: null,
    outcomeMeasures: null,
    measureDetails: null,
    loading: true,
    measureEvaluators: null
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
        case GET_MEASURE_DETAILS:
        return {
            ...state,
            measureDetails: action.payload,
            loading: false
        }
        case GET_MEASURE_EVALUATORS: {
            return{
                ...state,
                measureEvaluators: action.payload,
                loading: false
            }
        }
        case LOADING:
        return{
            loading:true
        }
        default:
            return state;
    }
}