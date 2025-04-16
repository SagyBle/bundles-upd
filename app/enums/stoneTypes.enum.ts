export const StoneTypes = {
  LAB_GROWN: "Lab Grown",
  NATURAL: "Natural",
};

export type StoneType = (typeof StoneTypes)[keyof typeof StoneTypes];
