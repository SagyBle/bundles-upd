export interface BundleOptionSelection {
  componentOptionId: string;
  name: string;
  values: string[];
}

interface ProductBundleOptionSelection {
  componentOptionId: string;
  name: string;
  values: string[];
}

interface ProductBundleComponent {
  quantity: number;
  productId: string;
  optionSelections: ProductBundleOptionSelection[];
}

export interface BundleInput {
  input: {
    title: string;
    components: ProductBundleComponent[];
  };
}
