// 找到所有符合條件的組合
export function findCombinations(sum: number,length: number,mustBeZeroIndexes: number[] = []): number[][] {
    const result: number[][] = [];

    function generateCombination(arr: number[], currentSum: number): void {
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

// 強化詞條數據種類
export function EnchanceAllCombinations(enhanceCounts: number[]): number[][][] {
    const results: number[][][] = [];
    const values: number[] = [0, 1, 2]; // 強化程度可能的值

    function backtrack(index: number, currentCombination: number[][]): void {
        // 如果所有詞條都已處理完成，保存結果
        if (index === enhanceCounts.length) {
          results.push([...currentCombination.map(c => [...c])]);
          return;
        }

        // 根據當前詞條的強化次數，生成所有可能的強化組合
        const enhanceCount = enhanceCounts[index];
        const possibleCombinations: number[][] = [];

        // 遍歷當前詞條的所有可能組合
        function generateEnhanceValues(temp: number[]): void {
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
