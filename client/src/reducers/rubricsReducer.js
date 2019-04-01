import { CREATE_RUBRIC, GET_RUBRICS, GET_SINGLE_RUBRIC } from '../actions/types'
const initialState = {
    rubric: {},
    rubrics: {},
    singleRubric: {}
}

export default function (state = initialState, action) {

    switch (action.type) {
        case CREATE_RUBRIC:
            //console.log(action.payload)
            return {
                ...state,
                rubric: action.payload
            }

        case GET_RUBRICS:
            //console.log(action.payload)
            return {
                ...state,
                rubrics: action.payload
            }

        case GET_SINGLE_RUBRIC:
            console.log(action.payload)
            return {
                ...state,
                singleRubric: action.payload
            }


        default:
            return state;
    }

}