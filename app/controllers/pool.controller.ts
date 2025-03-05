import { ShopifyResourceType } from "app/enums/gid.enums";
import { formatGid } from "app/utils/gid.util";

import { TagKey, TagValue } from "app/enums/tag.enums";
import { GraphQLFilterBuilder } from "app/utils/GraphQLFilterBuilder.util";
import { Tag } from "app/utils/Tag.util";
import { checkRequestType } from "app/utils/auth.util";
import PoolService from "app/services/pool.service";
import ProductService from "app/services/product.service";
import { parseRingMetafields } from "app/utils/product.util";
import { generateStoneQuery } from "app/utils/metafieldsToQuery";

const updatePoolDataType1 = async (request: Request) => {
  return { success: true, message: "Pool Type 1 updated successfully." };
};

const updatePoolDataType2 = async (request: Request) => {
  const query = new GraphQLFilterBuilder()
    .addOrGroup([
      Tag.generate(TagKey.Color, TagValue.Color.D),
      Tag.generate(TagKey.Color, TagValue.Color.E),
    ])
    .addOrGroup([
      Tag.generate(TagKey.Shape, TagValue.Shape.Cushion),
      Tag.generate(TagKey.Shape, TagValue.Shape.Marquise),
    ])
    .build();

  return { success: true, query, message: "Pool Type 2 updated successfully." };
};

const updateRelatedStones = async (request: Request) => {
  try {
    const { admin } = await checkRequestType(request);

    const formData = await request.formData();
    let productId = formData.get("productId") as string;
    let relatedStones = formData.get("relatedStones") as string;

    if (!productId) {
      throw new Error("Product ID is required.");
    }
    if (!relatedStones) {
      throw new Error("At least one related stone ID is required.");
    }

    productId = formatGid(productId, ShopifyResourceType.Product);
    const relatedProductIds = JSON.parse(relatedStones).map((id: string) =>
      formatGid(id, ShopifyResourceType.Product),
    );

    const response = await PoolService.updateRelatedStonesMetafield(
      { admin },
      request,
      productId,
      relatedProductIds,
    );

    return {
      success: true,
      message: "Related stones updated successfully.",
      response,
    };
  } catch (error: any) {
    console.error("Error updating related stones:", error);
    return { success: false, error: error.message };
  }
};

/**
 * This function fetches products by tag criteria.
 * For example, the query might be something like:
 *   (tag:Color_E) AND (tag:Shape_Marquise)
 */
const fetchProductsByTag = async (request: Request) => {
  try {
    const { admin } = await checkRequestType(request);

    const formData = await request.formData();
    let queryString = formData.get("queryString") as string;
    if (!queryString) throw new Error("Query string is required.");

    const products = await PoolService.fetchProductsByTag(
      { admin },
      request,
      queryString,
    );

    return {
      success: true,
      products,
    };
  } catch (error: any) {
    console.error("Error fetching products by tag:", error);
    return { success: false, error: error.message };
  }
};

const generateRingQuery = async (request: Request) => {
  try {
    const { admin } = await checkRequestType(request);

    const formData = await request.formData();
    let productId = formData.get("productId") as string;
    if (!productId) throw new Error("Ring productId is required.");

    productId = formatGid(productId, ShopifyResourceType.Product);

    const metafields = await ProductService.getProductMetafields(request, {
      productId,
    });

    const parsedRingMetafields = parseRingMetafields(metafields);
    const queryString = generateStoneQuery(parsedRingMetafields);

    const products = await PoolService.fetchProductsByTag(
      { admin },
      request,
      queryString,
    );

    const relatedProductIds = products.map((stone: any) => {
      let stoneId = stone.node.id;
      stoneId = formatGid(stoneId, ShopifyResourceType.Product);
      return stoneId;
    });

    PoolService.updateRelatedStonesMetafield(
      { admin },
      request,
      productId,
      relatedProductIds,
    );

    return {
      success: true,
      products,
    };
  } catch (error: any) {
    console.error("Error fetching products by tag:", error);
    return { success: false, error: error.message };
  }
};

export default {
  updatePoolDataType1,
  updatePoolDataType2,
  updateRelatedStones,
  fetchProductsByTag,
  generateRingQuery,
};
