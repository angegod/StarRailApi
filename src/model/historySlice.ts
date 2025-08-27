import { ImporterHistory } from '@/interface/importer';
import { SimulatorHistory } from '@/interface/simulator';
import { createSlice } from '@reduxjs/toolkit';


const initialState = {
    historyData: [] as SimulatorHistory[]|ImporterHistory[]
};

const historySlice = createSlice({
    name: 'history',
    initialState,
    reducers: {
        //新增歷史紀錄
        createHistory: (state, action) => {
            state.historyData = Array.isArray(action.payload) ? [...action.payload] : [];
        },
        //增加歷史紀錄
        addHistory: (state, action) => {
            state.historyData.push(action.payload);
        },
        //移除第一筆
        limitHistory: (state) => {
            if (state.historyData.length > 0) {
                state.historyData.shift(); // 移除第一筆
            }
        },
        //刪除資料
        deleteHistory: (state, action) => {
            state.historyData.splice(action.payload, 1);
        },
        //更新紀錄
        updateHistory: (state, action) => {
            const { index, newData } = action.payload;
            if (state.historyData[index]) {
                state.historyData[index] = {
                    ...state.historyData[index],
                    ...newData
                };
            }
        },
        //刪除所有資料
        resetHistory:(state) =>{
            state.historyData = [];
        }
    }
});

//操作方法
export const {
    createHistory,
    addHistory,
    limitHistory,
    deleteHistory,
    updateHistory,
    resetHistory
} = historySlice.actions;

export default historySlice.reducer;
