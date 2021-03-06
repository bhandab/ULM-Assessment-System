import { CREATE_RUBRIC, GET_RUBRICS, GET_SINGLE_RUBRIC, LOADING} from '../actions/types'
const initialState = {
    rubric: {},
    rubrics: {},
    singleRubric: {},
    loading: true
}

export default function (state = initialState, action) {

    switch (action.type) {
        case CREATE_RUBRIC:
            return {
                ...state,
                rubric: action.payload
            }

        case GET_RUBRICS:
            return {
                ...state,
                rubrics: action.payload,
                loading: false
            }

        case GET_SINGLE_RUBRIC:
            return {
                ...state,
                singleRubric: action.payload,
                loading: false
            }
        case LOADING:
            return {
                ...state,
                loading: true
            }
        default:
            return state;
    }

}