const countOccurrences = (rows: string[][], index: number) => {
  return rows.reduce((map, row) => {
    const key = row[index];
    if (key) map.set(key, (map.get(key) || 0) + 1);
    return map;
  }, new Map<string, number>());
};

export default countOccurrences;
