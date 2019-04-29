import {CYCLE_REPORT} from '../actions/types'

const initialState = {
    report: null
}

export default function (state = initialState, action) {

    switch (action.type) {
        case CYCLE_REPORT:
        return {
            ...state,
            report:action.payload
        }
        default:
            return state;
    }

}