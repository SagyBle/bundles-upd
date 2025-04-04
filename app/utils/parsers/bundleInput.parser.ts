import { ShopifyResourceType } from "app/enums/gid.enums";
import { formatGid } from "../gid.util";

export const formatBundleInput = (inputObject: any) => {
  let formattedInput = inputObject;
  formattedInput.ring.productId = formatGid(
    formattedInput.ring.productId,
    ShopifyResourceType.Product,
  );
  formattedInput.stones = formattedInput.stones.map((stone: any) => ({
    ...stone,
    productId: formatGid(stone.productId, ShopifyResourceType.Product),
  }));
  formattedInput.extrasInBundle = formattedInput.extrasInBundle.map(
    (extra: any) => ({
      ...extra,
      productId: formatGid(extra.productId, ShopifyResourceType.Product),
    }),
  );

  return formattedInput;
};

export const filterRingOptions = (ring: any, ringOptions: any) => {
  return ringOptions.map((ringOption: any) => {
    const matchedOption = ring.options.find(
      (opt: any) => opt.optionName === ringOption.name,
    );

    if (
      matchedOption &&
      ringOption.values.includes(matchedOption.optionValue)
    ) {
      return {
        ...ringOption,
        values: [matchedOption.optionValue],
      };
    }
    return ringOption;
  });
};

export function extractProductIdsFromArray<T extends { productId?: string }>(
  array: T[],
): string[] {
  return array
    .filter((item) => item.productId) // Ensure productId exists
    .map((item) => item.productId as string);
}
