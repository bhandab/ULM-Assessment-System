import axios from 'axios';
import {
    GET_ERRORS,
    GET_CYCLES,
    GET_CYCLES_MEASURES,
    GET_MEASURE_EVALUATORS,
    GET_MEASURE_STUDENTS,
    GET_CYCLES_OUTCOMES,
    GET_MEASURE_DETAILS,
    GET_ASSIGNED_STUDENTS,
    CYCLE_LOADING,
    GET_MEASURE_REPORT
}
    from './types';
import { toastr } from 'react-redux-toastr'

import {getRegisteredEvaluators} from './evaluatorAction'

export const getAssessmentCycles = () => dispatch => {
    axios
        .get("/api/cycles")
        .then(res => {
            dispatch({
                type: GET_CYCLES,
                payload: res.data
            })
        })

        .catch(err => dispatch({
            type: GET_CYCLES,
            payload: err.response.data
        }))
}

export const createCycle = (cycleName) => dispatch => {
    axios
        .post("/api/cycles/createCycle", cycleName)
        .then(() => toastr.success(
            "Cycle Created!",
            `Assessment Cycle Successfully Created!`
        ))
        .then(() => dispatch(getAssessmentCycles()))
        .catch(err =>
            dispatch({
                type: GET_ERRORS,
                payload: err.response.data
            }))
}

export const cycleMigrate = (cycleName,oldCycleID) => dispatch => {
    axios
    .post("/api/cycles/migrate",{cycleName,oldCycleID})
    .then(() => toastr.success(
        "Cycle Migrated!",
        "Assessment Cycle Successfully Migrated!"
    ))
    .then(() => dispatch(getAssessmentCycles()))
    .catch(err =>
        dispatch({
            type: GET_ERRORS,
            payload: err.response.data
        }))
}

export const closeCycle = (cycleID) => dispatch => {
    axios
    .post("/api/cycles/closeCycle",{cycleID})
    .then(() => toastr.success(
        "Cycle Closed!",
        "Assessment Cycle Successfully Closed!"
    ))
    .then(() => dispatch(getAssessmentCycles()))
    .catch(err =>
        dispatch({
            type: GET_ERRORS,
            payload: err.response.data
        }))
}

export const linkOutcomeToCycle = (cycleID, outcome) => dispatch => {
    axios
        .post("/api/cycles/" + cycleID + "/addNewOutcome", outcome)
        .then(() => toastr.success(
            "Learning Outcome Created!",
            "Learning Outcome Successfully Created!"
        ))
        .then((res) => {
            dispatch(getCycleMeasures(cycleID));
        })
        .catch(err =>
            dispatch({
                type: GET_ERRORS,
                payload: err.response.data
            }))
}

export const linkMeasureToOutcome = (cycleID, outcomeID, details) => dispatch => {
    // console.log(details)
    axios
        .post("/api/cycles/" + cycleID + "/" + outcomeID + "/addNewMeasure", details)
        .then(() => toastr.success(
            "Performance Measure Created!",
            "Performance Measure Successfully Created!"
        ))
        .then(() => {
            dispatch(getOutcomesMeasures(cycleID, outcomeID));
        })
        .catch(err =>
            dispatch({
                type: GET_ERRORS,
                payload: err.response.data
            }))
}

export const deleteMeasure = (cycleID, learnID, measureID) => dispatch => {
    axios
    .post(`/api/cycles/${cycleID}/${learnID}/${measureID}/delete`)
    .then(() => toastr.success(
        "Performance Measure Deleted!",
        "Performance Measure Successfully Deleted!"
    ))
    .then( ()=> window.location.assign(`/admin/cycles/cycle/${cycleID}/outcomes/${learnID}`))
    .catch(err =>
        dispatch({
            type: GET_ERRORS,
            payload: err.response.data
        }))
}

export const updateMeasure = (cycleID,outcomeID,measureID, body) => dispatch => {
    console.log(body)
    axios
    .post(`/api/cycles/${cycleID}/${outcomeID}/${measureID}/update`,body)
    .then(() => toastr.success(
        "Updated!",
        "Performance Measure Successfully Updated!"
    ))
    .then(()=> dispatch(getMeasureDetails(cycleID, outcomeID, measureID)))
    .catch(err =>
        dispatch({
            type: GET_ERRORS,
            payload: err.response.data
        }))
}

export const getCycleMeasures = (cycleID) => dispatch => { //outcomes of a cycle
    //dispatch(setLoading())
    axios
        .get("/api/cycles/" + cycleID + "/outcomes")
        .then(res => {
            dispatch({
                type: GET_CYCLES_OUTCOMES,
                payload: res.data
            })
        })
        .catch(err => {
            // console.log(err)
            dispatch({
                type: GET_ERRORS,
                payload: err.response.data

            }
            )
        })
}

export const getOutcomesMeasures = (cycleID, outcomeID) => dispatch => { //measures of outcomes
    dispatch(setLoading())
    axios
        .get("/api/cycles/" + cycleID + "/" + outcomeID + "/measures")
        .then(res => {
            dispatch({
                type: GET_CYCLES_MEASURES,
                payload: res.data
            })
        })
        .catch(err => {
            // console.log(err)
            dispatch({
                type: GET_ERRORS,
                payload: err.response.data

            }
            )
        })
}


export const updateCycleName = (cycleID, body) => dispatch => {
    axios
        .post("/api/cycles/" + cycleID + "/update", body)
        .then(() => toastr.success(
            "Updated!",
            "Assessment Cycle Successfully Updated!"
        ))
        .then(() => dispatch(getAssessmentCycles()))
        .catch(err => {
            // console.log(err)
            dispatch({
                type: GET_ERRORS,
                payload: err.response.data

            }
            )
        })
}

export const deleteCycle = (cycleID) => dispatch => {
    axios
        .post("/api/cycles/" + cycleID + "/delete")
        .then(() => toastr.success(
            "Deleted!",
            "Assessment Cycle Successfully Deleted!"
        ))
        .then(() => dispatch(getAssessmentCycles()))
        .catch(err => {
            const message = (err.response.data.outcomeExistingInsideCycle)
            toastr.error(
                "Delete Fail!",
                message)
            dispatch({
                type: GET_ERRORS,
                payload: err.response.data

            }
            )
        })


}

export const updateOutcomeName = (cycleID, outcomeID, body) => dispatch => {
    axios
        .post("/api/cycles/" + cycleID + "/" + outcomeID + "/update", body)
        .then(() => toastr.success(
            "Updated!",
            "Learning Outcome Successfully Updated!"
        ))
        .then(() => dispatch(getCycleMeasures(cycleID)))
        .catch(err => {
            // console.log(err)
            dispatch({
                type: GET_ERRORS,
                payload: err.response.data

            }
            )
        })
}

export const deleteOutcome = (cycleID, outcomeID) => dispatch => {
    axios
        .post("/api/cycles/" + cycleID + "/" + outcomeID + "/delete")
        .then(() => toastr.success(
            "Deleted!",
            "Learning Outcome Successfully Deleted!"
        ))
        .then(() => dispatch(getCycleMeasures(cycleID)))
        .catch(err => {
            const message = (err.response.data.measureExistingInsideOutcome)
            toastr.error(
                "Delete Fail!",
                message)
            dispatch({
                type: GET_ERRORS,
                payload: err.response.data

            }
            )
        })
}

export const getMeasureDetails = (cycleID, outcomeID, measureID) => dispatch => {
    axios
        .get("/api/cycles/" + cycleID + "/" + outcomeID + "/" + measureID + "/measureDetails")
        .then(res => {
            dispatch({
                type: GET_MEASURE_DETAILS,
                payload: res.data
            })
        })
        .then(dispatch(getMeasureEvaluators(measureID)))
        .then(dispatch(getStudentsOfMeasure(measureID)))
        .then(dispatch(getRegisteredEvaluators()))
        .then(dispatch(getAssignedStudents(measureID)))
        .catch(err => {
            dispatch({
                type: GET_ERRORS,
                payload: err.response.data

            }
            )
        })
}

export const getMeasureEvaluators = (measureID) => dispatch => {
    axios
        .get("/api/cycles/" + measureID + "/measureEvaluators")
        .then(res => {
            dispatch({
                type: GET_MEASURE_EVALUATORS,
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

export const addEvaluator = (measureID, body) => dispatch => {
    axios
        .post("/api/cycles/" + measureID + "/addEvaluator", body)
        .then(() => toastr.success(
            "Evaluator Added!",
            "Measure Evaluator Successfully Added!"
        ))
        .then(() => dispatch(getMeasureEvaluators(measureID)))
        .catch(err => {
            const message = err.response.data.evaluatorEmail
            toastr.error(
                "Error!",
                message)
            dispatch({
                type: GET_ERRORS,
                payload: err.response.data

            }
            )
        })
}

export const deleteEvaluator = (measureID, measureEvalID) => dispatch => {
    axios
    .post("/api/cycles/"+measureID+"/deleteMeasureEvaluator",{measureEvalID})
    .then(() => toastr.success(
        "Evaluator Deleted!",
        "Measure Evaluator Successfully Deleted!"
    ))
    .then(() => dispatch(getMeasureEvaluators(measureID)))
    .catch(err => {
        dispatch({
            type: GET_ERRORS,
            payload: err.response.data

        }
        )
    })
}

export const addStudentToMeasure = (measureID, body) => dispatch => {
    axios
        .post("/api/cycles/" + measureID + "/addStudent", body)
        .then(() => toastr.success(
            "Student Added!",
            "Student Successfully Added To Measure!"
        ))
        .then(() => dispatch(getStudentsOfMeasure(measureID)))
        .catch(err => {
            dispatch({
                type: GET_ERRORS,
                payload: err.response.data

            })
        })
}

export const addStudentsToMeasure = (measureID, formData, config) => dispatch => {
    axios
        .post("/api/cycles/" + measureID + "/uploadStudents", formData, config)
        .then(() => toastr.success(
            "Students Added!",
            "Students Successfully Added To Measure!"
        ))
        .then(() => dispatch(getStudentsOfMeasure(measureID)))
        .catch(err => {
            dispatch({
                type: GET_ERRORS,
                payload: err.response.data

            })
        })
}

export const deleteStudent = (measureID, studentID) => dispatch => {
    axios
    .post("/api/cycles/"+measureID+"/deleteStudent",{studentID})
    .then(() => toastr.success(
        "Student Deleted!",
        "Student Successfully Deleted From Measure!"
    ))
    .then(() => dispatch(getStudentsOfMeasure(measureID)))
    .catch(err => {
        dispatch({
            type: GET_ERRORS,
            payload: err.response.data

        })
    })
}

export const getStudentsOfMeasure = (measureID) => dispatch => {
    axios
        .get("/api/cycles/" + measureID + "/studentsList")
        .then(res => {
            dispatch({
                type: GET_MEASURE_STUDENTS,
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

export const getAssignedStudents = (measureID) => dispatch => {
    axios
        .get("/api/cycles/" + measureID + "/assignedStudentsInformation")
        .then(res => {
            dispatch({
                type: GET_ASSIGNED_STUDENTS,
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

export const assignStudentsToMeasure = (measureID, body) => dispatch => {
    axios
        .post("/api/cycles/" + measureID + "/assign",body)
        .then(() => toastr.success(
            "Student(s) Assigned!",
            "Student Successfully Assigned To Measure Evaluator!"
        ))
        .then(() => dispatch(getAssignedStudents(measureID)))
        .then(()=> dispatch(getStudentsOfMeasure(measureID)))
        .catch(err => {
            dispatch({
                type: GET_ERRORS,
                payload: err.response.data

            })
        })
}

export const assignStudentsToTest = (measureID, body) => dispatch => {
    axios
        .post("/api/cycles/" + measureID + "/testAssign",body)
        .then(() => toastr.success(
            "Student(s) Assigned!",
            "Student Successfully Assigned To Measure Evaluator!"
        ))
        .then(() => dispatch(getAssignedStudents(measureID)))
        .catch(err => {
            dispatch({
                type: GET_ERRORS,
                payload: err.response.data

            })
        })
}

export const getMeasureRubricReport = (measureID) => dispatch => {
    axios
    .get("/api/cycles/"+measureID+"/measureRubricReport")
        .then(res =>
            dispatch({
                type: GET_MEASURE_REPORT,
                payload: res.data
            })
        )
        .catch(err => {
            dispatch({
                type: GET_ERRORS,
                payload: err.response.data

            })
        })

}

/***Need to change the following two actions */

export const uploadTestScores = (measureID,formData, config) => dispatch => {
    axios
    .post("/api/cycles/"+measureID+"/uploadTestScores",formData,config)
    .catch(err => {
        dispatch({
            type: GET_ERRORS,
            payload: err.response.data

        })
    })
}

export const addStudentScore = (measureID,body) => dispatch => {
    axios
    .post("/api/cycles/"+measureID+"/addStudentScore",body)
    .catch(err => {
        dispatch({
            type: GET_ERRORS,
            payload: err.response.data

        })
    })
}

export const getMeasureTestReport = (measureID) => dispatch => {
    axios
    .get("/api/cycles/"+measureID+"/measureTestReport")
        .then(res =>
            dispatch({
                type: GET_MEASURE_REPORT,
                payload: res.data
            })
        )
        .catch(err => {
            dispatch({
                type: GET_ERRORS,
                payload: err.response.data

            })
        })

}

export const setLoading = () => {
    return {
        type: CYCLE_LOADING
    }
}

