import { GET_MEASURES} from "../actions/types";

const initialState = {
    measures: null
}

export default function (state = initialState, action) {
    switch (action.type) {
        case GET_MEASURES:
            return {
                ...state,
                measures: action.payload
            }

        default:
            return state
    }

}