export const metadata = {
  title: '崩鐵 - 遺器重擲機率計算器',
  description: '提供崩鐵遺器重洗與重擲的手動數據輸入功能，模擬副屬出現機率，幫助玩家精準評估與規劃遺器屬性。',
  keywords: [
    '遺器重洗',
    '遺器重擲',
    '遺器重擲模擬器',
    '遺器機率計算',
    '遺器副屬機率',
    'relic reroll',
    'relic simulator',
    'relic calculator',
    'relic probability',
    'relic enchant'
  ],
};

import Simulator from "./simulator";

export default function Page() {
  return (
      <Simulator/>
  );
}