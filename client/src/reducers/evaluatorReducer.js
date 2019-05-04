import {GET_REGISTERED_EVALUATORS, GET_INVITED_EVALUATORS} from '../actions/types'

const initialState = {
    evaluators : null,
    evaluator: null,
    invitedEvaluators: null
}

export default function (state = initialState, action) {
    switch (action.type) {
        case GET_REGISTERED_EVALUATORS:
            return {
                ...state,
                evaluators: action.payload
            }
        case GET_INVITED_EVALUATORS:
        return{
            ...state,
            invitedEvaluators:action.payload
        }
        default:
            return state;
    }
}

