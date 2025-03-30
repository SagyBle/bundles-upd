import {
  GRAPHQL_ADJUST_INVENTORY_QUANTITY,
  GRAPHQL_CREATE_PRODUCT_MEDIA,
  GRAPHQL_DELETE_PRODUCT,
  GRAPHQL_GET_PRODUCT_BY_ID,
  GRAPHQL_GET_PRODUCT_DEFAULT_VARIANT_ID,
  GRAPHQL_GET_PRODUCT_METAFIELDS,
  GRAPHQL_GET_PRODUCT_OPTIONS,
  GRAPHQL_NEW_CREATE_PRODUCT,
  GRAPHQL_NEW_UPDATE_PRODUCT,
  GRAPHQL_POPULATE_PRODUCT,
  GRAPHQL_TAGS_REMOVE,
  GRAPHQL_UPDATE_INVENTORY_ITEM,
  GRAPHQL_UPDATE_LIST_METAFIELD,
  GRAPHQL_UPDATE_PRODUCT_VARIANTS,
} from "app/graphql/product.queries";
import { authenticate } from "app/shopify.server";
import { ProductVariantUpdateInput } from "app/types/product.types";
import { ShopifyService } from "./api/shopify.api.service";

const newUpdateProduct = async (
  auth: any,
  request: Request,
  input: { id: string; title?: string; status?: "ACTIVE" | "DRAFT" },
) => {
  try {
    const variables = {
      product: {
        id: input.id,
        ...(input.title && { title: input.title }),
        ...(input.status && { status: input.status }),
      },
    };

    const data: any = ShopifyService.executeGraphQL(
      auth,
      GRAPHQL_NEW_UPDATE_PRODUCT,
      variables,
    );

    return data?.productUpdate?.product || null;
  } catch (error) {
    console.error("Error updating product:", error);
    return null;
  }
};

const newUpdateProductVariants = async (
  auth: any,
  request: Request,
  input: { productId: string; variants: ProductVariantUpdateInput[] },
) => {
  try {
    //   throw new Error("Unauthorized: No valid admin or session.");
    // }

    const data: any = await ShopifyService.executeGraphQL(
      auth,
      GRAPHQL_UPDATE_PRODUCT_VARIANTS,
      {
        productId: input.productId,
        variants: input.variants,
      },
    );

    return data?.productVariantsBulkUpdate?.productVariants || null;
  } catch (error) {
    console.error("❌ Error updating product variants:", error);
    return null;
  }
};

const newDeleteProduct = async (
  auth: any,
  request: Request,
  input: { id: string },
) => {
  console.log("sagy101", "newDeleteProduct product service!");

  try {
    const data: any = await ShopifyService.executeGraphQL(
      auth,
      GRAPHQL_DELETE_PRODUCT,
      { id: input.id },
    );

    const errors = data?.productDelete?.userErrors;
    if (errors?.length) {
      throw new Error(
        `Failed to delete product: ${errors.map((e: any) => e.message).join(", ")}`,
      );
    }

    return data?.productDelete?.deletedProductId || null;
  } catch (error) {
    console.error("Error deleting product:", error);
    return null;
  }
};

export const getProductById = async (
  request: Request,
  input: { id: string }, // ✅ Standardized input
) => {
  const { admin } = await authenticate.admin(request);

  const response = await admin.graphql(GRAPHQL_GET_PRODUCT_BY_ID, {
    variables: { id: input.id },
  });

  const responseJson = await response.json();
  return responseJson.data?.product || null;
};

export const getProductMetafields = async (
  request: Request,
  input: { productId: string },
) => {
  console.log("sagy19");

  const { admin } = await authenticate.admin(request);

  console.log("sagy200", input);

  const response = await admin.graphql(GRAPHQL_GET_PRODUCT_METAFIELDS, {
    variables: { input: input.productId },
  });

  const responseJson = await response.json();

  return (
    responseJson.data?.product?.metafields?.edges.map(
      (edge: any) => edge.node,
    ) || []
  );
};

export const getProductOptions = async (
  auth: any,
  request: Request,
  input: { id: string },
) => {
  try {
    const data: any = await ShopifyService.executeGraphQL(
      auth,
      GRAPHQL_GET_PRODUCT_OPTIONS,
      { id: input.id },
    );

    if (!data?.product?.options) {
      console.error("❌ GraphQL Error - No product options returned:", data);
      return [];
    }

    return data.product.options.map((option: any) => ({
      componentOptionId: option.id,
      name: option.name,
      values: option.values,
    }));
  } catch (error) {
    console.error("❌ Error fetching product options:", error);
    return [];
  }
};

export const getProductDefaultVariantId = async (
  auth: any,
  request: Request,
  input: { productId: string },
) => {
  try {
    const data: any = await ShopifyService.executeGraphQL(
      auth,
      GRAPHQL_GET_PRODUCT_DEFAULT_VARIANT_ID,
      { productId: input.productId },
    );
    console.log("sagy29", data);

    return data?.product?.variants?.edges?.[0]?.node?.id || null;
  } catch (error) {
    console.error("❌ Error fetching default variant ID:", error);
    return null;
  }
};

export const newPopulateProduct = async (
  auth: any,
  request: Request,
  input: { id: string },
) => {
  try {
    const data: any = await ShopifyService.executeGraphQL(
      auth,
      GRAPHQL_POPULATE_PRODUCT,
      { id: input.id },
    );

    // ✅ Step 4: Handle errors or return the product data
    if (!data?.product) {
      console.error("❌ GraphQL Error - No product returned:", data);
      return null;
    }

    return data.product;
  } catch (error) {
    console.error(
      "❌ Error fetching product details including metafields:",
      error,
    );
    return null;
  }
};

export const newCreateProductMedia = async (
  auth: any,
  request: Request,
  input: {
    productId: string;
    media: { alt?: string; mediaContentType: string; originalSource: string }[];
  },
): Promise<{ id: string; previewUrl: string }[] | null> => {
  try {
    console.log("🚀 Uploading media for product:", input.productId);

    const data: any = await ShopifyService.executeGraphQL(
      auth,
      GRAPHQL_CREATE_PRODUCT_MEDIA,
      input,
    );

    console.log("📢 Media Upload Response:", JSON.stringify(data, null, 2));

    const uploadedMedia = data?.productCreateMedia?.media || [];
    const userErrors = data?.productCreateMedia?.userErrors || [];

    if (userErrors.length > 0) {
      console.error("❌ Shopify Media Upload Errors:", userErrors);
      return null;
    }

    return uploadedMedia.map((media: any) => ({
      id: media.id,
      previewUrl: media.preview?.image?.originalSrc || "",
    }));
  } catch (error) {
    console.error("❌ Error uploading product media:", error);
    return null;
  }
};

const newAdjustInventoryQuantity = async (
  auth: any,
  request: Request,
  input: any,
) => {
  try {
    const variables = {
      input: {
        reason: input.reason || "correction",
        name: "available",
        referenceDocumentUri:
          input.referenceDocumentUri ||
          "logistics://some.warehouse/take/2023-01/13",
        changes: [
          {
            delta: 1,
            inventoryItemId: input.inventoryItemId,
            locationId: input.locationId,
          },
        ],
      },
    };

    console.log("sagy3", variables);

    // // ✅ Step 3: Execute Admin API request
    // const data: any = await AdminShopifyService.executeGraphQL(
    //   request,
    //   GRAPHQL_ADJUST_INVENTORY_QUANTITY,
    //   variables,
    // );
    const data: any = await ShopifyService.executeGraphQL(
      auth,
      GRAPHQL_ADJUST_INVENTORY_QUANTITY,
      variables,
    );

    // ✅ Step 4: Check for errors and return response
    const errors = data?.inventoryAdjustQuantities?.userErrors || [];
    if (errors.length > 0) {
      console.error("❌ Inventory Adjustment Error:", errors);
      return null;
    }

    return data?.inventoryAdjustQuantities?.inventoryAdjustmentGroup || null;
  } catch (error) {
    console.error("❌ Error adjusting inventory:", error);
    return null;
  }
};

const newCreateProduct = async (auth: any, request: Request, input: any) => {
  try {
    const data: any = await ShopifyService.executeGraphQL(
      auth,
      GRAPHQL_NEW_CREATE_PRODUCT,
      { product: input },
    );

    if (data?.productCreate?.userErrors?.length) {
      console.error("❌ Shopify Errors:", data.productCreate.userErrors);
      return null;
    }

    return data?.productCreate?.product || null;
  } catch (error) {
    console.error("❌ Error creating product:", error);
    return null;
  }
};

const newUpdateInventoryItem = async (
  auth: any,
  request: Request,
  input: { id: string; tracked?: boolean },
) => {
  try {
    const variables = {
      id: input.id,
      input: {
        ...(input.tracked !== undefined && { tracked: input.tracked }),
      },
    };

    const data: any = await ShopifyService.executeGraphQL(
      auth,
      GRAPHQL_UPDATE_INVENTORY_ITEM,
      variables,
    );

    const errors = data?.inventoryItemUpdate?.userErrors || [];
    if (errors.length > 0) {
      console.error("❌ Inventory Update Errors:", errors);
      return null;
    }

    return data?.inventoryItemUpdate?.inventoryItem || null;
  } catch (error) {
    console.error("❌ Error updating inventory item:", error);
    return null;
  }
};

// SAGY: continue from here, modify it to work with flow of deactivation.
const modifyListMetafield = async (
  auth: any,
  request: Request,
  productId: string,
  key: string,
  namespace: string,
  options: {
    valueToRemove?: string;
    valueToAdd?: string;
  },
) => {
  console.log(
    "sagy_mod",
    `Modify metafield list ${namespace}.${key} for product: ${productId}`,
  );

  const { valueToRemove, valueToAdd } = options;

  // Fetch current metafields
  const metafields = await getProductMetafields(request, { productId });

  const metafieldToModify = metafields?.find(
    (metafield: any) =>
      metafield.key === key && metafield.namespace === namespace,
  );

  if (!metafieldToModify) {
    console.warn("Metafield not found.");
    return null;
  }

  let values: string[] = [];

  try {
    values = JSON.parse(metafieldToModify.value);
  } catch (error) {
    console.error("Failed to parse metafield value as JSON array", error);
    return null;
  }

  // Remove value if needed
  if (valueToRemove) {
    values = values.filter((v) => v !== valueToRemove);
  }

  // Add value if needed and not a duplicate
  if (valueToAdd && !values.includes(valueToAdd)) {
    values.push(valueToAdd);
  }

  console.log("sagy_mod_finalList", values);

  // If nothing changed, return
  if (!valueToAdd && !valueToRemove) {
    console.log("Nothing to modify in metafield.");
    return values;
  }

  const updated = await updateListMetafield(auth, request, {
    productId,
    valueToAssign: JSON.stringify(values),
    namespace,
    key,
  });

  console.log("sagy_mod_updated", updated);

  return updated;
};

const addValueToListMetafield = async (
  auth: any,
  request: Request,
  productId: string, // the product that owns the metafield
  key: string,
  namespace: string,
  valueToAdd: string,
) => {
  console.log(
    "sagy_add",
    `add this value: ${valueToAdd} to metafield : ${namespace}.${key} in product: ${productId}`,
  );

  // 1. Get current metafield list value
  const metafields = await getProductMetafields(request, { productId });

  const metafieldToModify = metafields?.find(
    (metafield: any) =>
      metafield.key === key && metafield.namespace === namespace,
  );

  if (!metafieldToModify) {
    console.warn("Metafield not found for adding.");
    return null;
  }

  const currentValues: string[] = JSON.parse(metafieldToModify.value);

  // 2. Avoid duplicates
  if (currentValues.includes(valueToAdd)) {
    console.log("Value already exists in metafield list.");
    return currentValues;
  }

  const newValues = [...currentValues, valueToAdd];

  // 3. Update metafield with new list
  const updatedListMetafield = await updateListMetafield(auth, request, {
    productId,
    valueToAssign: JSON.stringify(newValues),
    namespace,
    key,
  });

  console.log("sagy_add_result", updatedListMetafield);

  return updatedListMetafield;
};

const updateListMetafield = async (
  auth: any,
  request: Request,
  input: {
    productId: string;
    valueToAssign: string; // should be a JSON stringified list of product GIDs
    namespace: string;
    key: string;
  },
) => {
  try {
    const variables = {
      productId: input.productId,
      valueToAssign: input.valueToAssign,
      namespace: input.namespace,
      key: input.key,
    };

    const data: any = await ShopifyService.executeGraphQL(
      auth,
      GRAPHQL_UPDATE_LIST_METAFIELD,
      variables,
    );

    const userErrors = data?.metafieldsSet?.userErrors || [];
    if (userErrors.length > 0) {
      console.error("❌ Metafield Update Errors:", userErrors);
      return null;
    }

    return data?.metafieldsSet?.metafields || null;
  } catch (error) {
    console.error("❌ Error updating list metafield:", error);
    return null;
  }
};

import { GRAPHQL_TAGS_ADD } from "app/graphql/product.queries";

// ...

const addTagsToProduct = async (
  auth: any,
  request: Request,
  input: {
    productId: string;
    tags: string[];
  },
) => {
  try {
    const variables = {
      id: input.productId,
      tags: input.tags,
    };

    const data: any = await ShopifyService.executeGraphQL(
      auth,
      GRAPHQL_TAGS_ADD,
      variables,
    );

    const userErrors = data?.tagsAdd?.userErrors || [];
    if (userErrors.length > 0) {
      console.error("❌ Tag Add Errors:", userErrors);
      return null;
    }

    return data?.tagsAdd?.node?.id || null;
  } catch (error) {
    console.error("❌ Error adding tags to product:", error);
    return null;
  }
};

const removeTagsFromProduct = async (
  auth: any,
  request: Request,
  input: {
    productId: string;
    tags: string[];
  },
) => {
  try {
    const variables = {
      id: input.productId,
      tags: input.tags,
    };

    const data: any = await ShopifyService.executeGraphQL(
      auth,
      GRAPHQL_TAGS_REMOVE,
      variables,
    );

    const userErrors = data?.tagsAdd?.userErrors || [];
    if (userErrors.length > 0) {
      console.error("❌ Tag Remove Errors:", userErrors);
      return null;
    }

    return data?.tagsAdd?.node?.id || null;
  } catch (error) {
    console.error("❌ Error removing tags from product:", error);
    return null;
  }
};

export default {
  newCreateProduct,
  newUpdateProductVariants,
  newDeleteProduct,
  newUpdateProduct,
  getProductMetafields,
  newPopulateProduct,
  newCreateProductMedia,
  newAdjustInventoryQuantity,
  newUpdateInventoryItem,
  getProductDefaultVariantId,
  getProductOptions,
  modifyListMetafield,
  // addValueToListMetafield,
  updateListMetafield,
  addTagsToProduct,
  removeTagsFromProduct,
};
