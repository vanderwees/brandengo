import React from 'react';
import ReactDOM from 'react-dom';

// Redux
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import trainStore from './reducers';

import Onboarding from './components/Onboarding';

// Inject Redux devtools hooks
const store = createStore(trainStore, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());

document.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(
    <Provider store={ store }>
      <Onboarding />
    </Provider>,
    document.getElementById('stationContainer')
  );
});
