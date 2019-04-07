import {GET_REGISTERED_EVALUATORS} from '../actions/types'

const initialState = {
    evaluators : null,
    evaluator: null
}

export default function (state = initialState, action) {
    switch (action.type) {
        case GET_REGISTERED_EVALUATORS:
            console.log(action.payload)
            return {
                ...state,
                evaluators: action.payload
            }
        default:
            return state;
    }
}

