export function findCombinations(sum, length, mustBeZeroIndexes = []) {
  const result = [];

  function generateCombination(arr, currentSum) {
    if (arr.length === length) {
      if (currentSum === sum) {
        result.push([...arr]);
      }
      return;
    }

    for (let i = 0; i <= sum - currentSum; i++) {
      arr.push(i);
      generateCombination(arr, currentSum + i);
      arr.pop();
    }
  }

  generateCombination([], 0);

  // 🔽 過濾條件：指定的索引值必須為 0
  return result.filter(arr => mustBeZeroIndexes.every(index => arr[index] === 0));
}


// 測試
//console.log(findCombinations(4, 9));

//強化詞條數據種類
export  function EnchanceAllCombinations(enhanceCounts) {
    const results = [];
    const values = [0, 1, 2]; // 強化程度可能的值

    function backtrack(index, currentCombination) {
      // 如果所有詞條都已處理完成，保存結果
      if (index === enhanceCounts.length) {
        results.push([...currentCombination]);
        return;
      }

      // 根據當前詞條的強化次數，生成所有可能的強化組合
      const enhanceCount = enhanceCounts[index];
      const possibleCombinations = [];

      // 遍歷當前詞條的所有可能組合
      function generateEnhanceValues(temp) {
        if (temp.length === enhanceCount) {
          possibleCombinations.push([...temp]);
          return;
        }
        for (const value of values) {
          temp.push(value);
          generateEnhanceValues(temp);
          temp.pop();
        }
      }

      generateEnhanceValues([]);

      // 對於當前詞條的每一種可能組合，繼續處理下一個詞條
      for (const combination of possibleCombinations) {
        currentCombination.push(combination);
        backtrack(index + 1, currentCombination);
        currentCombination.pop();
      }
    }

    backtrack(0, []);
    return results;
}