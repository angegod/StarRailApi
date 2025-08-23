import { createSlice } from '@reduxjs/toolkit';

const updateDetailsWindowSlice = createSlice({
    name: 'updateDetailsWindow',
    initialState: {
        status: false
    },
    reducers: {
        openWindow: (state) => {
            state.status = true;
        },
        closeWindow: (state) => {
            state.status = false;
        }
    }
});

export const { openWindow, closeWindow } = updateDetailsWindowSlice.actions;
export default updateDetailsWindowSlice.reducer;
