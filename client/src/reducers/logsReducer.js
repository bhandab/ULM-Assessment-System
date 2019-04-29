import {COORDINATOR_ACTIVITY, EVALUATOR_ACTIVITY} from '../actions/types'

const initialState = {
    coordinatorLogs : null,
    evalLogs:null,
    logLoading: true
}
export default function (state = initialState, action) {
    switch (action.type) {
           case COORDINATOR_ACTIVITY:
           return {
               ...state,
               coordinatorLogs: action.payload,
               logLoading: false
           }

           case EVALUATOR_ACTIVITY:
           return{
               ...state,
               evalLogs: action.payload,
               logLoading: false
           }
           case 'LOG_LOADING':
            return {
                ...state,
                logLoading:true
            }

           default:
           return{
               ...state
            }
    }
}