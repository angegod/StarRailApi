"use client";

import { useEffect } from "react";
import updateDetails from "@/data/updateDetails";
import { useDispatch, useSelector } from "react-redux";
import { openWindow, closeWindow } from "@/model/updateDetailsSlice";
import { RootState } from "@/model/reducer";

export const UpdatedSection = () => {
    const dispatch = useDispatch();
    
    const status = useSelector((state:RootState) => state.updateDetailsWindow.status); // 監聽狀態
    const handleOpenWindow = () => dispatch(openWindow());
    const handleCloseWindow = () => dispatch(closeWindow());

    const data = updateDetails;

    useEffect(() => {
        const storedValue = localStorage.getItem(data.updateType);

        // 如果沒存過 或 updateKey 不同 → 顯示公告
        if (!storedValue || storedValue !== data.updateKey) {
            handleOpenWindow();
        }
    }, [data.updateType, data.updateKey, handleOpenWindow]);

    const handleConfirmClose = () => {
        handleCloseWindow();
        localStorage.setItem(data.updateType, data.updateKey);
    };

    if (!status) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
            <div className="bg-gray-900 w-11/12 max-w-lg p-4 rounded-xl shadow-lg">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-xl text-red-500 font-bold">
                        {data.updateDate.toISOString().split("T")[0]} 更新公告
                    </span>
                    <button onClick={handleConfirmClose} className="text-white text-xl font-bold hover:text-red-400">✕</button>
                </div>
                <ul className="list-decimal ml-6 space-y-1">
                    {data.updateContent.map((d, i) => (
                        <li key={i} className="text-white">{d}</li>
                    ))}
                </ul>

                <div className="mt-6 text-right">
                    <button onClick={handleConfirmClose} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
                        我知道了
                    </button>
                </div>
            </div>
        </div>
    );
};
