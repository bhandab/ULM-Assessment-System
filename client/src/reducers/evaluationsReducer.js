import { EVALUATION_RUBRICS, EVALUATION_DETAILS, RUBRIC_SCORES,TEST_SCORES } from '../actions/types' 

const initialState = {
    evaluationRubrics: null,
    evaluationDetails: null,
    rubricScores:null,
    testScores:null
}

export default function (state = initialState, action) {
    switch (action.type) {
        case EVALUATION_RUBRICS:
            return {
                ...state,
                evaluationRubrics: action.payload
            }
        case EVALUATION_DETAILS:
            return {
                ...state,
                evaluationDetails: action.payload
            }
            case RUBRIC_SCORES:
            return {
                ...state,
                rubricScores: action.payload
            }
            case TEST_SCORES:
            return {
                ...state,
                testScores:action.payload
            }
        default:
            return state;

    }
}
