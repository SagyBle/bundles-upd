import { TagKey } from "app/enums/tag.enums";
import poolService from "app/services/pool.service";
import productService from "app/services/product.service";
import { checkRequestType } from "app/utils/auth.util";
import { generateStoneQuery } from "app/utils/metafieldsToQuery";
import { pickBestReplacementStone } from "app/utils/replacement.util";
import { Tag } from "app/utils/Tag.util";

const deactivateStoneProduct = async (request: Request) => {
  console.log("sagy131");

  try {
    const { admin, isAdmin } = await checkRequestType(request);

    const formData = await request.formData();
    const stone_id = formData.get("stone_id") as string;
    const reason = formData.get("reason") as string;
    console.log("sagy131.5", { stone_id, reason });

    const stoneIdTag = Tag.generate(TagKey.StoneId, stone_id);
    console.log("sagy132", { stone_id }, { stoneIdTag });

    // get shopify producy by stone_id (which is tag).
    const queryStringByStoneId = generateStoneQuery({ stoneId: stone_id });
    console.log(
      "sagy133",
      { queryStringByStoneId },
      "supposed to see here valid query string to try in the graphiql",
    );

    const fetchedProductsByTag = await poolService.fetchProductsByTag(
      { admin },
      request,
      queryStringByStoneId,
    );

    if (!fetchedProductsByTag || fetchedProductsByTag.length !== 1) {
      throw new Error("❌ Expected exactly one product node in edges.");
    }

    const stoneProduct = fetchedProductsByTag[0]?.node;

    const shopifyProductGid = fetchedProductsByTag[0]?.node?.id;
    console.log("sagy190", { shopifyProductGid }, { stoneProduct });

    const inactiveTags = Tag.findInactiveStatusTags(stoneProduct.tags);

    // If stone was sold, notice customer support.
    if (inactiveTags && inactiveTags.length > 0) {
      console.log(
        "sagy210",
        "*%*%*%*%*%*%*%*%*% Stone Bought although it's Sold *%*%*%*%*%*%*%*%*%",
      );
    }

    console.log("sagy190.1", { inactiveTags });

    const inactiveTag = Tag.generateInactiveStatus(reason);

    const inactiveStoneTagAdded = await productService.addTagsToProduct(
      { admin },
      request,
      { productId: shopifyProductGid, tags: [inactiveTag] },
    );

    // add the tag sold/inactive to the stone!

    const metafields = await productService.getProductMetafields(request, {
      productId: shopifyProductGid,
    });

    console.log("sagy191", { metafields });

    const ringsMetafield = metafields.find(
      (field: any) => field.key === "rings" && field.namespace === "custom",
    );

    console.log("sagy193", { ringsMetafield });
    const relatedRingsProductGids = JSON.parse(ringsMetafield.value);
    console.log("sagy194", relatedRingsProductGids);

    const parsed = Tag.parseMany(stoneProduct.tags);
    console.log("sagy201", parsed);

    const queryStringByStoneTags = generateStoneQuery({
      stonesShapes: [parsed.shape],
      stonesWeights: [parsed.weight],
      stonesColors: [parsed.color],
    });

    console.log("sagy195", { queryStringByStoneTags });

    const fetchedReplacementsProducts = await poolService.fetchProductsByTag(
      { admin },
      request,
      queryStringByStoneTags,
    );

    console.log(
      "sagy196",
      fetchedReplacementsProducts,
      "look for 10082617131295",
    );
    console.log(
      "******************",
      fetchedReplacementsProducts,
      "******************",
    );

    const replacementStone = pickBestReplacementStone(
      fetchedReplacementsProducts,
    );

    console.log("sagy197", { replacementStone });

    if (!replacementStone) {
      console.log("No replacement stone found");
      return;
    }

    const replacementStoneId = replacementStone?.node?.id;
    console.log("sagy198", "Replacement Stone ID:", replacementStoneId);

    relatedRingsProductGids.forEach(async (ringProductGid: string) => {
      await productService.modifyListMetafield(
        { admin },
        request,
        ringProductGid,
        "relatedstones",
        "custom",
        { valueToRemove: shopifyProductGid, valueToAdd: replacementStoneId },
      );

      // add to the stone the realted ring
      console.log(
        "sagy199",
        `add to ${replacementStoneId}, to the metafield custom.relatedstones the value to add: ${ringProductGid}`,
      );

      await productService.modifyListMetafield(
        { admin },
        request,
        replacementStoneId,
        "rings",
        "custom",
        {
          valueToAdd: ringProductGid,
        },
      );
    });

    return {
      success: true,
    };
  } catch (error: any) {
    console.error("Error fetching products by tag:", error);
    return { success: false, error: error.message };
  }
};

export default {
  deactivateStoneProduct,
};
