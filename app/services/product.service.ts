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
  GRAPHQL_UPDATE_INVENTORY_ITEM,
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
};
