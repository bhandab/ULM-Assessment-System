import axios from 'axios'
import {GET_REGISTERED_COORDINATORS, GET_INVITED_COORDINATORS, GET_PROGRAMS,GET_ERRORS} from './types'
import {toastr} from 'react-redux-toastr'

export const inviteCoordinator = (body) => dispatch =>{
    axios
    .post("/api/coordinators/invite",body)
    .then(() => toastr.success(
        "Coordinator Invited!",
        "Program Coordinator Successfully Invited!"
    ))
    .then(()=> dispatch(getInvitedCoordinators(body.programID)))
    .catch(err =>
        dispatch({
            type: GET_ERRORS,
            payload: err.response.data
        })
    );
}

export const deleteCoordinator = (body,programID) => dispatch => {
    axios
    .post ("/api/coordinators/deleteCoordinator",body)
    .then(() => toastr.success(
        "Coordinator Deleted!",
        "Program Coordinator Successfully Deleted!"
    ))
    .then (()=> dispatch(getRegisteredCoordinators(programID)))
    .catch(err =>
        dispatch({
            type: GET_ERRORS,
            payload: err.response.data
        })
    );
}

export const uninviteCoordinator = (programID,body) => dispatch => {
    axios
    .post ("/api/coordinators/deleteInvitedCoordinator",body)
    .then(() => toastr.success(
        "Coordinator Invitation Cancelled!",
        "Program Coordinator Successfully Uninvited!"
    ))
    .then (()=> dispatch(getInvitedCoordinators(programID)))
    .catch(err =>
        dispatch({
            type: GET_ERRORS,
            payload: err.response.data
        })
    );
}

export const getInvitedCoordinators = (programID) => dispatch => {
    console.log(programID)
    axios
    .get("/api/coordinators/invitedCoordinators/"+programID)
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

        })
    })

}

export const getRegisteredCoordinators = (programID) => dispatch => {
    axios
    .get("/api/coordinators/registeredCoordinators/"+programID)
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
    .then(() => toastr.success(
        "Program Created!",
        "New Assessment Program Successfully Deleted!"
    ))
    .then(()=> dispatch(getPrograms()))
    .catch(err => {
        dispatch({
            type: GET_ERRORS,
            payload: err.response.data

        }
        )
    })

}

export const updateProgram = (body) => dispatch => {
    axios
    .post("/api/coordinators/updateProgram",body)
    .then(() => toastr.success(
        "Program Updated!",
        "Assessment Program Successfully Updated!"
    ))
    .then(()=> dispatch(getPrograms()))
    .catch(err => {
        dispatch({
            type: GET_ERRORS,
            payload: err.response.data

        }
        )
    })

}