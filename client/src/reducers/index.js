import { combineReducers } from "redux";
import authReducer from "./authReducer";
import errorReducer from "./errorReducer";
import outcomesReducer from './outcomesReducer';
import measuresReducer from "./measuresReducer";
import cyclesReducer from "./cyclesReducer";
import rubricsReducer from "./rubricsReducer";
import evaluatorReducer from "./evaluatorReducer";
import evaluationsReducer from "./evaluationsReducer";

export default combineReducers({
    auth: authReducer,
    errors: errorReducer,
    outcomes: outcomesReducer,
    measures: measuresReducer,
    cycles: cyclesReducer,
    rubric: rubricsReducer,
    evaluator: evaluatorReducer,
   evaluations: evaluationsReducer
});