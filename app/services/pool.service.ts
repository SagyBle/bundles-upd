import { GRAPHQL_GET_PRODUCTS_BY_TAG } from "app/graphql/pool.queries";
import { GRAPHQL_UPDATE_RELATED_STONES_METAFIELD } from "app/graphql/product.queries";
import { ShopifyService } from "./api/shopify.api.service";

export const updateRelatedStonesMetafield = async (
  auth: any,
  request: Request,
  productId: string,
  relatedProductIds: string[],
) => {
  try {
    const response = await ShopifyService.executeGraphQL(
      auth,
      GRAPHQL_UPDATE_RELATED_STONES_METAFIELD,
      {
        productId,
        relatedProductIds: JSON.stringify(relatedProductIds),
      },
    );

    if (!response) {
      throw new Error("Failed to update related stones metafield.");
    }

    return response;
  } catch (error: any) {
    console.error("Error updating related stones metafield:", error);
    throw error;
  }
};

export const fetchProductsByTag = async (
  auth: any,
  request: any,
  queryString: string,
) => {
  const variables = { query: queryString };

  const data: any = await ShopifyService.executeGraphQL(
    auth,
    GRAPHQL_GET_PRODUCTS_BY_TAG,
    variables,
  );

  const products = data?.products?.edges || [];
  return products;
};

export default {
  updateRelatedStonesMetafield,
  fetchProductsByTag,
};
