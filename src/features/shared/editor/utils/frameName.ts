export const generateDefaultFrameName = (): string => {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[-:]/g, '').replace('T', '_');
  return `Frame_${timestamp}`;
};
