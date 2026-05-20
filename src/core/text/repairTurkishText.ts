const directReplacements: Array<[string, string]> = [
  ["TUBITAK", "T\u00dcB\u0130TAK"],
  ["T\u00dcB0TAK", "T\u00dcB\u0130TAK"],
  ["T\uFFFDB0TAK", "T\u00dcB\u0130TAK"],
  ["PROD0S", "PROD\u0130S"],
  ["KOB0", "KOB\u0130"],
  ["m1?", "m\u0131?"],
];

export const repairTurkishText = (value: string): string => {
  let text = value;

  for (const [from, to] of directReplacements) {
    text = text.split(from).join(to);
  }

  return text;
};
