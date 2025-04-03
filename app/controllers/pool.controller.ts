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
import NodejsApiService from "app/services/api/nodejs.api.service";
import deactivationController from "./deactivation.controller";
import { InventoryUpdate } from "app/utils/parsers/inventoryUpdates/uni.inventoryUpdates.parser";
import productService from "app/services/product.service";

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
  console.log("sagy320");

  try {
    const { admin } = await checkRequestType(request);

    const formData = await request.formData();
    let productId = formData.get("productId") as string;
    if (!productId) throw new Error("Ring productId is required.");

    productId = formatGid(productId, ShopifyResourceType.Product);
    console.log("sagy321", { productId });

    const metafields = await ProductService.getProductMetafields(request, {
      productId,
    });
    console.log("sagy322", { metafields });

    const parsedRingMetafields = parseRingMetafields(metafields);

    const combinationsSettings: {
      shape: string;
      color: string;
      carat: string;
      clarity: string;
    }[] = [];

    for (let i = 0; i < parsedRingMetafields.stonesColors.length; i++) {
      const color = parsedRingMetafields.stonesColors[i];
      const clarityLevel = parsedRingMetafields.stonesClarities[i];

      for (const c of parsedRingMetafields.stonesWeights) {
        combinationsSettings.push({
          shape: parsedRingMetafields.stonesShapes[0], // only one shape provided
          carat: c,
          color,
          clarity: clarityLevel,
        });
      }
    }

    console.log("Calculating Combinations settings...");

    console.log("sagy234", combinationsSettings);

    const combinationsSettingsWithQuery = combinationsSettings.map((cs) => ({
      ...cs,
      queryString: generateStoneQuery({
        stonesShapes: [cs.shape],
        stonesWeightsRange20: [cs.carat],
        stonesColors: [cs.color],
        stonesClarities: [cs.clarity],
        active: true,
      }),
    }));

    // 🔁 For each combination, fetch matching products and attach them
    const enrichedCombinationsSettings = [];
    for (const setting of combinationsSettingsWithQuery) {
      const products = await PoolService.fetchProductsByTag(
        { admin },
        request,
        setting.queryString,
      );

      enrichedCombinationsSettings.push({
        ...setting,
        "products.length": products.length,
        product: selectProduct(products), // 🧠 This will contain an array of matching product nodes
      });
    }

    // 🔀 Group enriched results
    const { relatedStonesA, relatedStonesB, relatedStonesC } =
      splitIntoABCGroups(enrichedCombinationsSettings, 4);

    console.log("✅sagy237 Grouped with Products", {
      relatedStonesA,
      relatedStonesB,
      relatedStonesC,
    });

    const ring = await ProductService.newPopulateProduct({ admin }, request, {
      id: productId,
    });

    console.log("sagy501", ring.metafields);
    ring.metafields.edges.map((edge: any) => console.log("sagy503", edge.node));

    const oldRelatedStones: string[] = [];

    ring.metafields.edges.forEach((edge: any) => {
      const node = edge.node;
      if (
        node.namespace === "custom" &&
        node.key.startsWith("relatedstones") &&
        Array.isArray(JSON.parse(node.value))
      ) {
        const ids = JSON.parse(node.value);
        oldRelatedStones.push(...ids);
      }
    });

    oldRelatedStones.map(async (oldRS) => {
      const resDelete = await productService.modifyListMetafield(
        { admin },
        request,
        oldRS,
        "rings",
        "custom",
        {
          valueToRemove: productId,
        },
      );
      console.log(
        "sagy505",
        resDelete,
        `from this stone: ${oldRS} remove this ring: ${productId}`,
      );
    });

    const extractProductIds = (group: any[]) =>
      group.map(
        (rs) =>
          rs.product?.node?.id ||
          formatGid("10115240001823", ShopifyResourceType.Product),
      );

    const realtedStonesAIds = extractProductIds(relatedStonesA);
    const realtedStonesBIds = extractProductIds(relatedStonesB);
    const realtedStonesCIds = extractProductIds(relatedStonesC);

    console.log("sagy238", {
      realtedStonesAIds,
      realtedStonesBIds,
      realtedStonesCIds,
    });

    const realtedStonesAResponse = await ProductService.updateListMetafield(
      { admin },
      request,
      {
        productId,
        valueToAssign: JSON.stringify(realtedStonesAIds),
        namespace: "custom",
        key: "relatedstonesa",
      },
    );
    const realtedStonesBResponse = await ProductService.updateListMetafield(
      { admin },
      request,
      {
        productId,
        valueToAssign: JSON.stringify(realtedStonesBIds),
        namespace: "custom",
        key: "relatedstonesb",
      },
    );
    const realtedStonesCResponse = await ProductService.updateListMetafield(
      { admin },
      request,
      {
        productId,
        valueToAssign: JSON.stringify(realtedStonesCIds),
        namespace: "custom",
        key: "relatedstonesc",
      },
    );

    console.log(
      "sagy239",
      realtedStonesAResponse,
      realtedStonesBResponse,
      realtedStonesCResponse,
    );

    [...realtedStonesAIds, ...realtedStonesBIds, ...realtedStonesCIds].map(
      async (rsId) => {
        await productService.modifyListMetafield(
          { admin },
          request,
          rsId,
          "rings",
          "custom",
          { valueToAdd: productId },
        );
      },
    );

    return {
      success: true,
      ring,
      relatedStones: { relatedStonesA, relatedStonesB, relatedStonesC },
    };
  } catch (error: any) {
    console.error("Error fetching products by tag:", error);
    return { success: false, error: error.message };
  }
};

const syncStoneUpdates = async (request: Request) => {
  // const res = await NodejsApiService.put(
  //   "/api/stonesApi/uni/fetch-inventory-updates",
  //   {},
  // );
  const inventoryUpdates: InventoryUpdate[] =
    await NodejsApiService.syncUniUpdates({});
  console.log("sagy124", { inventoryUpdates });

  // // run the controller of deactivation
  // const responseDeactivationShopify =
  //   await deactivationController.deactivateStoneProduct(
  //     request,
  //     inventoryUpdates[0],
  //   );

  const results = await Promise.all(
    inventoryUpdates.map((update) =>
      deactivationController.deactivateStoneProduct(request, update),
    ),
  );

  const total = results.length;
  const successCount = results.filter((r) => r.success).length;
  const failedStoneIds = results
    .filter((r) => !r.success)
    .map((r) => r?.deactivatedStoneId || "unknown");

  console.log(`✅ Successfully updated ${successCount}/${total} stones.`);
  console.log("📦 Finished updating MongoDB items!");

  if (failedStoneIds.length > 0) {
    console.warn("❌ Failed to update the following stone_ids:");
    console.warn(failedStoneIds);
  }

  return {
    success: true,
    message: "syncStoneUpdates pressed.",
    inventoryUpdates,
  };
};

function splitIntoABCGroups(entries: any[], chunkSize: number) {
  const relatedStonesA: any[] = [];
  const relatedStonesB: any[] = [];
  const relatedStonesC: any[] = [];

  for (let i = 0; i < entries.length; i++) {
    if (i < chunkSize) {
      relatedStonesA.push(entries[i]);
    } else if (i < chunkSize * 2) {
      relatedStonesB.push(entries[i]);
    } else {
      relatedStonesC.push(entries[i]);
    }
  }

  return {
    relatedStonesA,
    relatedStonesB,
    relatedStonesC,
  };
}

const selectProduct = (products: any[]) => {
  if (!products || products.length === 0) return null;

  const randomIndex = Math.floor(Math.random() * products.length);
  return products[randomIndex];
};

export default {
  updatePoolDataType1,
  updatePoolDataType2,
  updateRelatedStones,
  fetchProductsByTag,
  generateRingQuery,
  syncStoneUpdates,
};
