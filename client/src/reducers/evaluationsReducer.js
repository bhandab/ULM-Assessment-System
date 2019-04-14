import { EVALUATION_DETAILS } from '../actions/types' 

const initialState = {
    evaluationDetails: null
}

export default function (state = initialState, action) {
    switch (action.type) {
        case EVALUATION_DETAILS:
            //console.log(action.payload)
            return {
                ...state,
                evaluationDetails: action.payload
            }
        case 'a':
            return {
                ...state,
            }
        default:
            return state;
    }
}
