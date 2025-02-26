const convertToUserEnteredValue = (cell: Date | string | number) => {
  if (cell instanceof Date) {
    return {
      numberValue: Math.trunc(
        (cell.getTime() - cell.getTimezoneOffset() * 60 * 1000) / (1000 * 60 * 60 * 24) + 25569,
      ),
    };
  }
  if (typeof cell === 'number') {
    return { numberValue: cell };
  }
  if (cell.startsWith('=')) {
    return { formulaValue: cell };
  }
  return { stringValue: cell };
};

export default convertToUserEnteredValue;
