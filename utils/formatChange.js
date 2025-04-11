export const formatChange = (change) => {
  return parseFloat(change).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}; 