const option = (state = [], action) => {
  switch (action.type) {
    case 'ADD_OPTION':
      return [
        ...state,
        {
          id: action.id,
          text: action.text,
          completed: false
        }
      ];
    case 'UPDATE_OPTION':
      return state.map(
        option => {
          (option.name === action.name)
          ? action
          : option
      })
    default:
      return state
  }
};

export default option;
