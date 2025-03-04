import { extractProductIds, flattenProductIds } from "app/utils/bundle.util";
import { formatGid } from "app/utils/gid.util";
import { ShopifyResourceType } from "app/enums/gid.enums";
import { BundleInput } from "app/types/budnle.types";
import {
  GRAPHQL_NEW_UPDATE_PRODUCT_METAFIELDS,
  GRAPHQL_PRODUCT_BUNDLE_CREATE,
  GRAPHQL_PRODUCT_BUNDLE_OPERATION,
} from "app/graphql/bundle.queries";
import { retryWithDelay } from "app/utils/general.util";
import productService from "./product.service";
import { checkRequestType } from "app/utils/auth.util";
import { AdminShopifyService } from "./api/adminShopify.api.service";
import { SessionShopifyService } from "./api/sessionShopify.api.service";
import { ShopifyService } from "./api/shopify.api.service";

const createBundle = async (
  auth: any,
  request: Request,
  input: BundleInput,
) => {
  try {
    const data: any = await ShopifyService.executeGraphQL(
      auth,
      GRAPHQL_PRODUCT_BUNDLE_CREATE,
      input,
    );

    console.log("sagy299", data);

    const bundleOperationId =
      data?.productBundleCreate?.productBundleOperation?.id;
    let bundleProductId = await getProductIdFromBundleOperation(
      auth,
      request,
      bundleOperationId,
    );

    if (!bundleProductId) bundleProductId = "";

    const userErrors = data?.bundleCreate?.userErrors;
    const productsIds = extractProductIds(input);

    if (userErrors?.length) {
      throw new Error(
        `Bundle creation failed: ${userErrors.map((e: any) => e.message).join(", ")}`,
      );
    }

    await updateBundleMetafieldProductsIds(
      auth,
      request,
      bundleProductId,
      productsIds,
    );

    await productService.newUpdateProduct(auth, request, {
      id: bundleProductId,
      status: "ACTIVE",
    });

    return bundleProductId;
  } catch (error) {
    console.error("Error creating bundle:", error);
    throw new Error("Failed to create bundle.");
  }
};

const updateBundleMetafieldProductsIds = async (
  auth: any,
  request: Request,
  productId: string,
  bundledProductIds: string[],
) => {
  try {
    // ✅ Step 1: Check request type
    // const { isAdmin, isSession } = await checkRequestType(request);

    // ✅ Step 2: Format Product & Metafield Data
    const formattedProductId = formatGid(
      productId,
      ShopifyResourceType.Product,
    );
    const formattedBundledProducts = bundledProductIds
      .map((id) => formatGid(id, ShopifyResourceType.Product))
      .join(", ");

    const variables = {
      metafields: [
        {
          ownerId: formattedProductId,
          key: "product_bundles",
          namespace: "custom",
          type: "single_line_text_field",
          value: formattedBundledProducts,
        },
      ],
    };

    const data: any = await ShopifyService.executeGraphQL(
      auth,
      GRAPHQL_NEW_UPDATE_PRODUCT_METAFIELDS,
      variables,
    );

    // ✅ Step 5: Handle API Response
    const userErrors = data?.productUpdate?.userErrors;
    if (userErrors?.length) {
      throw new Error(
        `Metafield update failed: ${userErrors.map((e: any) => e.message).join(", ")}`,
      );
    }

    return data?.productUpdate?.product?.metafields.edges.map(
      (edge: any) => edge.node,
    );
  } catch (error) {
    console.error("Error updating bundle metafield:", error);
    throw new Error("Failed to update bundle metafield.");
  }
};

const getProductIdFromBundleOperation = async (
  auth: any,
  request: Request,
  bundleOperationId: string,
): Promise<string | null> => {
  try {
    console.log("sagy300", bundleOperationId);

    return retryWithDelay(async () => {
      const data: any = await ShopifyService.executeGraphQL(
        auth,
        GRAPHQL_PRODUCT_BUNDLE_OPERATION,
        { id: bundleOperationId },
      );
      return data?.productOperation?.product?.id || null;
    });
  } catch (error) {
    console.error("Error retrieving product ID from bundle operation:", error);
    return null;
  }
};

export default {
  createBundle,
  updateBundleMetafieldProductsIds,
  getProductIdFromBundleOperation,
};
