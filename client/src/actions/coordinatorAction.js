import axios from 'axios'
import {GET_REGISTERED_COORDINATORS, GET_INVITED_COORDINATORS, GET_PROGRAMS,GET_ERRORS} from './types'


export const inviteCoordinator = (body) => dispatch =>{
    axios
    .post("/api/coordinators/invite",body)
    .catch(err =>
        dispatch({
            type: GET_ERRORS,
            payload: err.response.data
        })
    );
}

export const getInvitedCoordinators = () => dispatch => {
    axios
    .get("/api/coordinators/invitedCoordinators")
    .then(res => {
        dispatch({
            type: GET_INVITED_COORDINATORS,
            payload: res.data
        })
    })
    .catch(err => {
        dispatch({
            type: GET_ERRORS,
            payload: err.response.data

        }
        )
    })

}

export const getRegisteredCoordinators = () => dispatch => {
    axios
    .get("/api/coordinators/registeredCoordinators")
    .then(res => {
        dispatch({
            type: GET_REGISTERED_COORDINATORS,
            payload: res.data
        })
    })
    .catch(err => {
        dispatch({
            type: GET_ERRORS,
            payload: err.response.data

        }
        )
    })

}

export const getPrograms = () => dispatch => {
    axios
    .get("/api/coordinators/programs")
    .then(res => {
        dispatch({
            type: GET_PROGRAMS,
            payload: res.data
        })
    })
    .catch(err => {
        dispatch({
            type: GET_ERRORS,
            payload: err.response.data

        }
        )
    })
}

export const createProgram = (progName) => dispatch => {
    axios
    .post("/api/coordinators/createProgram",progName)
    .then(()=> dispatch(getPrograms()))
    .catch(err => {
        dispatch({
            type: GET_ERRORS,
            payload: err.response.data

        }
        )
    })

}