import { combineReducers } from "redux";
import authReducer from "./authReducer";
import errorReducer from "./errorReducer";
import outcomesReducer from './outcomesReducer';
import measuresReducer from "./measuresReducer";
import cyclesReducer from "./cyclesReducer";
import rubricsReducer from "./rubricsReducer";
import evaluatorReducer from "./evaluatorReducer";
import evaluationsReducer from "./evaluationsReducer";
import coordinatorReducer from './coordinatorReducer';
import {reducer as toastrReducer} from 'react-redux-toastr';

export default combineReducers({
    auth: authReducer,
    errors: errorReducer,
    outcomes: outcomesReducer,
    measures: measuresReducer,
    cycles: cyclesReducer,
    rubric: rubricsReducer,
    evaluator: evaluatorReducer,
    evaluations: evaluationsReducer,
    coordinators: coordinatorReducer,
    toastr: toastrReducer
});