export const extractProductIds = (input: any): string[] => {
  if (!input || !input.input || !Array.isArray(input.input.components)) {
    throw new Error("Invalid input structure");
  }

  return input.input.components.map((component: any) => component.productId);
};

export const flattenProductIds = (productIds: string[]): string => {
  if (!Array.isArray(productIds) || productIds.length === 0) {
    throw new Error("Invalid product IDs array");
  }

  return productIds.join(", ");
};
