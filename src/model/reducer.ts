// src/store/index.js
import { configureStore } from '@reduxjs/toolkit';
import historyReducer from './historySlice';
import enchantReducer from './enchantDataSlice';
import updateDetailsWindowReducer from './updateDetailsSlice';

const store = configureStore({
    reducer: {
        history: historyReducer,
        enchant: enchantReducer,
        updateDetailsWindow: updateDetailsWindowReducer
    }
});

export default store;
export type RootState = ReturnType<typeof store.getState>;