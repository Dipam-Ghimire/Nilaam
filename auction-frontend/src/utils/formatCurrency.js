export const formatCurrency = (amount) => {
  if (isNaN(amount)) return "NPR 0";
  return `NPR ${Number(amount).toLocaleString("ne-NP")}`;
};