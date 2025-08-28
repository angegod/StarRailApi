import { enchantData } from '@/interface/enchant';
import { createSlice } from '@reduxjs/toolkit';


const initialState = {
    enchantData: {} as enchantData|{} // 要模擬的資料原版數據
};

const enchantDataSlice = createSlice({
    name:'enchantData',
    initialState,
    reducers:{
        //設置要模擬的數據原版
        setEnchantData:(state,action)=>{
            state.enchantData = action.payload;
        },
        //獲得模擬數據原版資料
        /*getEnchantData:(state)=>{
            return state.enchantData;
        },*/
        deleteEnchantData:(state)=>{
            state.enchantData = {};
        }
    }
});

export const {setEnchantData,deleteEnchantData} = enchantDataSlice.actions;
export default enchantDataSlice.reducer;