import { combineReducers } from "redux";
import authReducer from "./authReducer";
import errorReducer from "./errorReducer";
import outcomesReducer from './outcomesReducer';
import measuresReducer from "./measuresReducer";

export default combineReducers({
    auth: authReducer,
    errors: errorReducer,
    outcomes: outcomesReducer,
    measures: measuresReducer
});