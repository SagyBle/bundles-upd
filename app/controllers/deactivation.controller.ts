import { TagKey } from "app/enums/tag.enums";
import { Logger } from "app/logger/Logger";
import poolService from "app/services/pool.service";
import productService from "app/services/product.service";
import { checkRequestType } from "app/utils/auth.util";
import { isGid } from "app/utils/gid.util";
import { InactiveStonePurchaseHandler } from "app/utils/InactiveStonePurchase";
import { generateStoneQuery } from "app/utils/metafieldsToQuery";
import { InventoryUpdate } from "app/utils/parsers/inventoryUpdates/uni.inventoryUpdates.parser";
import { pickBestReplacementStone } from "app/utils/replacement.util";
import { Tag } from "app/utils/Tag.util";

const deactivateStoneProduct = async (
  request: Request,
  inventoryUpdate?: InventoryUpdate,
) => {
  Logger.info("deactivateStoneProduct started");

  try {
    const { admin } = await checkRequestType(request);

    // Support from inventoryUpdate (preferred)
    let stone_id: string | null = null;
    let reason: string | null = null;

    if (inventoryUpdate) {
      stone_id = inventoryUpdate.stone_id;
      reason =
        inventoryUpdate.updateType === "inactive" ? "apiUpdate" : "details";
    } else {
      // Fallback to formData
      const formData = await request.formData();
      stone_id = formData.get("stone_id") as string;
      reason = formData.get("reason") as string;
    }

    if (!stone_id || !reason) {
      throw new Error("Missing required stone_id or reason.");
    }

    console.log("sagy102", { stone_id, reason });
    Logger.info(`Deactivating stone_id: ${stone_id}, because of: ${reason}`);

    const stoneIdTag = Tag.generate(TagKey.StoneId, stone_id);

    // Find Shopify product by stone_id
    const queryStringByStoneId = generateStoneQuery({ stoneId: stone_id });
    console.log("sagy103", { queryStringByStoneId });

    const fetchedProductsByTag = await poolService.fetchProductsByTag(
      { admin },
      request,
      queryStringByStoneId,
    );
    console.log("sagy104", { fetchedProductsByTag });

    if (!fetchedProductsByTag || fetchedProductsByTag.length !== 1) {
      throw new Error("❌ Expected exactly one product node in edges.");
    }

    const stoneProduct = fetchedProductsByTag[0]?.node;
    const shopifyProductGid = stoneProduct?.id;

    if (!isGid(shopifyProductGid)) {
      throw new Error("Can't get valid Shopify product GID.");
    }

    console.log("sagy106.5", { "stoneProduct.tags": stoneProduct.tags });

    const isInactiveStone = Tag.hasInactiveStatus(stoneProduct.tags);
    if (isInactiveStone) {
      InactiveStonePurchaseHandler.notifyCustomerService(stone_id);
    }

    console.log("sagy106", { isInactiveStone });

    const inactiveTags = Tag.generateInactiveStatus(reason);
    const inactiveStoneTagAdded = await productService.addTagsToProduct(
      { admin },
      request,
      { productId: shopifyProductGid, tags: inactiveTags },
    );

    if (!inactiveStoneTagAdded) {
      Logger.error("Stone was sold but Inactive Stone Tag wasn't Added");
    }

    Logger.info(`Inactive ${reason} Stone Tag Added`);

    const metafields = await productService.getProductMetafields(request, {
      productId: shopifyProductGid,
    });

    const ringsMetafield = metafields.find(
      (field: any) => field.key === "rings" && field.namespace === "custom",
    );

    const relatedRingsProductGids = JSON.parse(ringsMetafield.value);

    console.log("sagy108", { relatedRingsProductGids });

    const parsedStoneTags = Tag.parseMany(stoneProduct.tags);
    console.log("sagy13", parsedStoneTags);

    const queryStringByStoneTags = generateStoneQuery({
      stonesShapes: [parsedStoneTags.shape.value],
      stonesWeights: [parsedStoneTags.weight.value],
      stonesColors: [parsedStoneTags.color.value],
      active: true,
    });
    console.log("sagy15", queryStringByStoneTags);

    const fetchedReplacementsProducts = await poolService.fetchProductsByTag(
      { admin },
      request,
      queryStringByStoneTags,
    );

    console.log("sagy16", fetchedReplacementsProducts);

    const replacementStone = pickBestReplacementStone(
      fetchedReplacementsProducts,
    );
    console.log("sagy17", replacementStone);

    if (!replacementStone) {
      Logger.error(
        `Not found replacement stone with the parameters: ${parsedStoneTags}`,
      );
      return {
        success: true,
        deactivatedStoneId: stone_id,
        deactivatedStoneProductGid: shopifyProductGid,
        replacementStoneProductGid: undefined,
      };
    }

    const replacementStoneId = replacementStone?.node?.id;
    console.log("sagy18", replacementStoneId);

    Logger.info(
      `Replacing related stone valueToRemove: ${shopifyProductGid} with valueToAdd: ${replacementStoneId} in:`,
    );

    relatedRingsProductGids.forEach(async (ringProductGid: string) => {
      const ringRelatedStonesUpdated = await productService.modifyListMetafield(
        { admin },
        request,
        ringProductGid,
        "relatedstones",
        "custom",
        { valueToRemove: shopifyProductGid, valueToAdd: replacementStoneId },
      );
      Logger.info(`${ringProductGid}: ${ringRelatedStonesUpdated}`);

      const stoneRelatedRingsUpdated = await productService.modifyListMetafield(
        { admin },
        request,
        replacementStoneId,
        "rings",
        "custom",
        {
          valueToAdd: ringProductGid,
        },
      );
      Logger.info(
        `${replacementStoneId}: in custom.rings metafield was updated with: ${ringProductGid}`,
      );
    });

    Logger.info("deactivateStoneProduct ends successfully");

    return {
      success: true,
      deactivatedStoneId: stone_id,
      deactivatedStoneProductGid: shopifyProductGid,
      replacementStoneProductGid: replacementStoneId,
    };
  } catch (error: any) {
    Logger.error(`Error deactivating product: ${error.message}`);
    return { success: false, error: error.message };
  }
};

export default {
  deactivateStoneProduct,
};
