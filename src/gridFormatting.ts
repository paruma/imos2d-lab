export const formatNumber = (value: number) =>
  Number.isInteger(value) ? String(value) : value.toLocaleString('en-US', { maximumFractionDigits: 4 });

export const cellFontSize = (text: string) => {
  if (text.length <= 3) return undefined;
  return `${Math.max(0.5, Math.min(0.95, 3.6 / text.length))}rem`;
};
