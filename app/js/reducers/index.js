import { combineReducers } from 'redux';
import position from './position';
import station from './station';
import option from './option';

const brandenGoApp = combineReducers({
  position,
  station,
  option
});

export default brandenGoApp;
