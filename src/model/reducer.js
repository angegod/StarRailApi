// src/store/index.js
import { configureStore } from '@reduxjs/toolkit';
import historyReducer from './historySlice';
import enchantReducer from './enchantDataSlice';

const store = configureStore({
    reducer: {
        history: historyReducer,
        enchant:enchantReducer
    }
});

export default store;