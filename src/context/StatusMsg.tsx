"use client";
import { createContext, useContext, useState, useRef, ReactNode } from "react";
import Image from "next/image";
import "../css/statusmsg.css";

// 背景模式的型別
type BgMode = "default" | "success" | "error" | "process";

// context 裡會提供的方法型別
interface StatusToastContextType {
    showStatus: (text: string, bg?: BgMode) => void;
    updateStatus: (text: string, bg?: BgMode | null) => void;
    hideStatus: () => void;
}

const StatusToastContext = createContext<StatusToastContextType | undefined>(undefined);

interface StatusToastProviderProps {
    children: ReactNode;
}

export const StatusToastProvider = ({ children }: StatusToastProviderProps) => {
    const [status, setStatus] = useState("");
    const [statusState, setStatusState] = useState<"idle" | "enter" | "exit">(
      "idle"
    );
    const [statusBg, setStatusBg] = useState("bg-stone-600");

    const bgMode = useRef<BgMode>("default");
    const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const animationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const statusBar = useRef<HTMLDivElement | null>(null);

    const applyBgMode = (mode: BgMode | null = null) => {
      const bg = mode || bgMode.current;

      switch (bg) {
        case "success":
          setStatusBg("bg-green-700");
          break;
        case "error":
          setStatusBg("bg-red-700");
          break;
        default:
          setStatusBg("bg-stone-600");
          break;
      }

      bgMode.current = bg;
    };

    const showStatus = (text: string, bg: BgMode = "default") => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
      if (animationTimer.current) clearTimeout(animationTimer.current);

      applyBgMode(bg);
      setStatus(text);
      setStatusState("enter");
    };

    const updateStatus = (text: string, bg: BgMode | null = null) => {
        if (toastTimer.current) clearTimeout(toastTimer.current);
        if (animationTimer.current) clearTimeout(animationTimer.current);

        applyBgMode(bg);
        setStatus(text);
        setStatusState("enter");

        toastTimer.current = setTimeout(() => {
            setStatusState("exit");

            animationTimer.current = setTimeout(() => {
              setStatus("");
              setStatusState("idle");
            }, 1000); // 對應 CSS 的淡出動畫時間
        }, 2000); // 顯示停留時間
    };

    const hideStatus = () => {
        if (toastTimer.current) clearTimeout(toastTimer.current);
        if (animationTimer.current) clearTimeout(animationTimer.current);

        setStatusState("exit");

        animationTimer.current = setTimeout(() => {
          setStatus("");
          setStatusState("idle");
        }, 1000);
    };

    return (
        <StatusToastContext.Provider value={{ showStatus, updateStatus, hideStatus }}>
          {children}
          <div
              ref={statusBar}
              className={`fixed w-full flex justify-center top-[50px] z-[200] opacity-80 ${
                statusState === "idle" ? "hidden" : ""
              } ${statusState === "enter" ? "toast-enter" : ""} ${
                statusState === "exit" ? "toast-exit" : ""}`}>
              <div className={`w-[120px] flex flex-row items-center justify-center ${statusBg} text-white px-3 py-3 rounded shadow-lg whitespace-pre-line text-center min-w-[250px]`}>
                  <MsgIcon bgMode={bgMode.current} />
                  <span className="font-bold">{status}</span>
              </div>
          </div>
        </StatusToastContext.Provider>
    );
};

interface MsgIconProps {
    bgMode: BgMode;
}

const MsgIcon = ({ bgMode }: MsgIconProps) => {
    let imageSrc = "";
    let className = "";

    switch (bgMode) {
        case "success":
            imageSrc = "check.svg";
            break;
        case "error":
            imageSrc = "cancel.svg";
            break;
        case "process":
            imageSrc = "retry.svg";
            className = "animate-spin";
            break;
        default:
            break;
    } 

    if (bgMode !== "default") {
        return (
            <Image
              src={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/image/${imageSrc}`}
              alt="Logo"
              width={25}
              height={25}
              className={`${className} mr-2`}/>
        );
    } else {
        return null;
    }
};

export const useStatusToast = (): StatusToastContextType => {
    const context = useContext(StatusToastContext);
    if (!context) {
      throw new Error("useStatusToast must be used within a StatusToastProvider");
    }
    return context;
};
