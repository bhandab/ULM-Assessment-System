import {GET_REGISTERED_COORDINATORS, GET_INVITED_COORDINATORS, GET_PROGRAMS} from '../actions/types'

const initialState = {
    invitedCoordinators: null,
    registeredCoordinators: null,
    programs:null
} 

export default function (state = initialState, action) {
    switch(action.type){
        case GET_INVITED_COORDINATORS:
        return{
            ...state,
            invitedCoordinators: action.payload

        }

        case GET_REGISTERED_COORDINATORS:
        return{
            ...state,
            registeredCoordinators: action.payload

        }

        case GET_PROGRAMS:
        return {
            ...StaticRange,
            programs: action.payload
        }

        default:
        return state
    }

    
}