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

const createBundle = async (request: Request, input: BundleInput) => {
  try {
    // ✅ Step 1: Check request type
    const { isAdmin, isSession } = await checkRequestType(request);

    if (isAdmin) {
      // ✅ Step 2: Proceed with Admin API request
      const data: any = await AdminShopifyService.executeGraphQL(
        request,
        GRAPHQL_PRODUCT_BUNDLE_CREATE,
        input,
      );

      const bundleOperationId =
        data?.productBundleCreate?.productBundleOperation?.id;
      let bundleProductId = await getProductIdFromBundleOperation(
        request,
        bundleOperationId,
      );

      if (!bundleProductId) bundleProductId = "";

      const userErrors = data?.bundleCreate?.userErrors;
      const productsIds = extractProductIds(input);

      // ✅ Update bundle product metafield
      await updateBundleMetafieldProductsIds(
        request,
        bundleProductId,
        productsIds,
      );

      if (userErrors?.length) {
        throw new Error(
          `Bundle creation failed: ${userErrors.map((e: any) => e.message).join(", ")}`,
        );
      }

      return bundleProductId;
    } else if (isSession) {
      // ✅ Step 3: Handle session request
      console.log("sagy28", "Session request");

      const data: any = await SessionShopifyService.executeGraphQL(
        request,
        GRAPHQL_PRODUCT_BUNDLE_CREATE,
        input,
      );

      console.log("sagy29", data);

      const bundleOperationId =
        data?.productBundleCreate?.productBundleOperation?.id;
      let bundleProductId = await getProductIdFromBundleOperation(
        request,
        bundleOperationId,
      );

      if (!bundleProductId) bundleProductId = "";

      console.log("Bundle product ID (Session):", bundleProductId);

      // ✅ Step 4: Extract product IDs
      const productsIds = extractProductIds(input);

      // ✅ Step 5: Update bundle product metafield for session-based requests
      await updateBundleMetafieldProductsIds(
        request,
        bundleProductId,
        productsIds,
      );

      await productService.updateProduct(request, {
        id: bundleProductId,
        status: "ACTIVE",
      });

      return bundleProductId;
    }

    throw new Error("Unauthorized: No valid admin or session.");
  } catch (error) {
    console.error("Error creating bundle:", error);
    throw new Error("Failed to create bundle.");
  }
};

const updateBundleMetafieldProductsIds = async (
  request: Request,
  productId: string,
  bundledProductIds: string[],
) => {
  try {
    // ✅ Step 1: Check request type
    const { isAdmin, isSession } = await checkRequestType(request);

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

    let data: any = null;

    if (isAdmin) {
      // ✅ Step 3: Execute GraphQL Request via Admin API
      data = await AdminShopifyService.executeGraphQL(
        request,
        GRAPHQL_NEW_UPDATE_PRODUCT_METAFIELDS,
        variables,
      );
    } else if (isSession) {
      // ✅ Step 4: Execute GraphQL Request via Session API
      data = await SessionShopifyService.executeGraphQL(
        request,
        GRAPHQL_NEW_UPDATE_PRODUCT_METAFIELDS,
        variables,
      );
    } else {
      throw new Error("Unauthorized: No valid admin or session.");
    }

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
  request: Request,
  bundleOperationId: string,
): Promise<string | null> => {
  try {
    const { isAdmin, isSession } = await checkRequestType(request);

    if (isAdmin) {
      return retryWithDelay(async () => {
        const data: any = await AdminShopifyService.executeGraphQL(
          request,
          GRAPHQL_PRODUCT_BUNDLE_OPERATION,
          { id: bundleOperationId },
        );
        return data?.productOperation?.product?.id || null;
      });
    } else if (isSession) {
      return retryWithDelay(async () => {
        const data: any = await SessionShopifyService.executeGraphQL(
          request,
          GRAPHQL_PRODUCT_BUNDLE_OPERATION,
          { id: bundleOperationId },
        );
        return data?.productOperation?.product?.id || null;
      });
    }

    throw new Error("Unauthorized: No valid admin or session.");
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
