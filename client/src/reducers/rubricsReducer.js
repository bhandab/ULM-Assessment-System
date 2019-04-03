import { CREATE_RUBRIC, GET_RUBRICS, GET_SINGLE_RUBRIC, GET_RUBRICS_GLOBAL } from '../actions/types'
const initialState = {
    rubric: {},
    rubrics: {},
    singleRubric: {},
    globalRubrics: {}
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
            //console.log(action.payload)
            return {
                ...state,
                singleRubric: action.payload
            }
      /*  case GET_RUBRICS_GLOBAL:
            //console.log("rubrics reducer")
            return {
                ...state,
                globalRubrics: action.payload
            }*/

        default:
            return state;
    }

}