const position = (state = {}, action) => {
  switch (action.type) {
    case 'SET_POSITION':
      return (state.latitude === action.latitude || state.longitude === action.longitude)
      ? action
      : state
    default:
      return state
  }
};

export default position;
