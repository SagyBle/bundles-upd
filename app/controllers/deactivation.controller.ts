import { TagKey } from "app/enums/tag.enums";
import { Logger } from "app/logger/Logger";
import poolService from "app/services/pool.service";
import productService from "app/services/product.service";
import { checkRequestType } from "app/utils/auth.util";
import { isGid } from "app/utils/gid.util";
import { InactiveStonePurchaseHandler } from "app/utils/InactiveStonePurchase";
import { generateStoneQuery } from "app/utils/metafieldsToQuery";
import { pickBestReplacementStone } from "app/utils/replacement.util";
import { Tag } from "app/utils/Tag.util";

const deactivateStoneProduct = async (request: Request) => {
  Logger.info("deactivateStoneProduct started");
  try {
    const { admin } = await checkRequestType(request);
    const formData = await request.formData();
    const stone_id = formData.get("stone_id") as string;
    const reason = formData.get("reason") as string;

    console.log("sagy102", { stone_id, reason });

    Logger.info(`deactivating stone_id: ${stone_id}, because of: ${reason}`);

    const stoneIdTag = Tag.generate(TagKey.StoneId, stone_id);

    // Finding the shopify product of the stone.
    const queryStringByStoneId = generateStoneQuery({ stoneId: stone_id });
    console.log("sagy103", { queryStringByStoneId });

    const fetchedProductsByTag = await poolService.fetchProductsByTag(
      { admin },
      request,
      queryStringByStoneId,
    );

    console.log("sagy104", { fetchedProductsByTag });

    // If the stone shopify product wasn't found, throw error.
    if (!fetchedProductsByTag || fetchedProductsByTag.length !== 1) {
      throw new Error("❌ Expected exactly one product node in edges.");
    }

    // Get stone shopify product object and gid.
    const stoneProduct = fetchedProductsByTag[0]?.node;
    const shopifyProductGid = fetchedProductsByTag[0]?.node?.id;

    console.log("sagy105", { shopifyProductGid });

    if (!isGid(shopifyProductGid)) {
      throw new Error("Can't get valid shopify product gid.");
    }
    console.log("sagy106.5", { "stoneProduct.tags": stoneProduct.tags });

    // If stone was already sold, notice customer support.
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
    console.log("sagy109.0", stoneProduct.tags);

    const parsedStoneTags = Tag.parseMany(stoneProduct.tags);
    console.log("sagy13", parsedStoneTags);

    // TODO: add a stone without tag of sold
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
    }
    Logger.info(`found replacement stone ${replacementStone}`);

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
    };
  } catch (error: any) {
    Logger.error(`Error deactivating product: ${error.message}`);
    return { success: false, error: error.message };
  }
};

export default {
  deactivateStoneProduct,
};
