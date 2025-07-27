import { createSlice } from '@reduxjs/toolkit';

const darkModeSlice = createSlice({
  name: 'darkMode',
  initialState: {
    enabled: localStorage.getItem('darkMode') === 'true',
  },
  reducers: {
    toggleDarkMode: (state) => {
      state.enabled = !state.enabled;
      localStorage.setItem('darkMode', state.enabled);
    },
    setDarkMode: (state, action) => {
      state.enabled = action.payload;
      localStorage.setItem('darkMode', action.payload);
    },
  },
});

export const { toggleDarkMode, setDarkMode } = darkModeSlice.actions;
export default darkModeSlice.reducer;
