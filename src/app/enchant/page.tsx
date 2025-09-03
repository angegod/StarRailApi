export const metadata = {
  title: '崩鐵 - 遺器重洗模擬器 - 強化模擬',
  description: '模擬崩鐵遺器在使用重洗道具後可能出現的屬性結果，提供強化模擬與數值預測，幫助玩家規劃最佳遺器配置。',
  keywords: [
    '遺器重洗',
    '遺器強化模擬',
    '遺器屬性模擬',
    '遺器重洗模擬器',
    '遺器重洗結果',
    'relic reroll',
    'relic simulator',
    'relic enchant',
    'relic reforging',
    'relic optimizer'
  ],
};


import Enchant from "./Enchant";

export default function Page() {
  return (
      <Enchant />
  );
}