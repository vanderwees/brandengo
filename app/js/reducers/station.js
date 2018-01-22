const station = (state = 0, action) => {
  // dummy for now
  switch (action.type) {
    case 'NOTHING':
      return state;
    case 'INCREMENT':
      return (state + 1);
    case 'DECREMENT':
      return (state - 1);
    default:
      return state;
  }
}

export default station;
