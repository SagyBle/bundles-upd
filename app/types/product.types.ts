export type ProductDataInput = {
  title: string;
};

export type ProductUpdateData = {
  title: string;
};

// TODO:  temporary until we'll understand which variants supposed to be here
export type ProductVariantUpdateInput = {
  id: string;
} & Record<string, any>;
