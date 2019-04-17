import { EVALUATION_RUBRICS, EVALUATION_DETAILS } from '../actions/types' 

const initialState = {
    evaluationRubrics: null,
    evaluationDetails: null
}

export default function (state = initialState, action) {
    switch (action.type) {
        case EVALUATION_RUBRICS:
            // console.log(action.payload)
            return {
                ...state,
                evaluationRubrics: action.payload
            }
        case EVALUATION_DETAILS:
            // console.log(action.payload)
            return {
                ...state,
                evaluationDetails: action.payload
            }
        default:
            return state;
    }
}
