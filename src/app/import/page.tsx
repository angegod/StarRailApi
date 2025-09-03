export const metadata = {
    title: '崩鐵 - 遺器重擲匯入工具',
    description: '透過 API 匯入崩鐵遺器數據，並進行重擲模擬與機率計算，快速分析與評估遺器屬性。',
    keywords: [
        '遺器重洗',
        '遺器重擲',
        '遺器匯入',
        '遺器機率計算',
        '遺器數據API',
        'relic importer',
        'relic reroll',
        'relic simulator',
        'relic calculator',
        'relic probability'
    ],
};


import Importer from "./Importer";

export default function Page() {
    return (
        <Importer/>
    );
}