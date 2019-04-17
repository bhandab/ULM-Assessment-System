import {GET_REGISTERED_COORDINATORS, GET_INVITED_COORDINATORS} from '../actions/types'

const initialState = {
    invitedCoordinators: null,
    registeredCoordinators: null
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

        default:
        return state
    }

    
}