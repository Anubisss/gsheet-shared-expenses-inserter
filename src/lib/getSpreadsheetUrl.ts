const getSpreadsheetUrl = (spreadsheetId: string, sheetId: string): string => {
  return `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit?gid=${sheetId}#gid=${sheetId}`;
};

export default getSpreadsheetUrl;
