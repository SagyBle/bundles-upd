import { TagKey } from "app/enums/tag.enums";
import poolService from "app/services/pool.service";
import productService from "app/services/product.service";
import { checkRequestType } from "app/utils/auth.util";
import { generateStoneQuery } from "app/utils/metafieldsToQuery";
import { Tag } from "app/utils/Tag.util";
import { l } from "node_modules/vite/dist/node/types.d-aGj9QkWt";

const deactivateStoneProduct = async (request: Request) => {
  console.log("sagy131");

  try {
    const { admin, isAdmin } = await checkRequestType(request);

    const formData = await request.formData();
    const stone_id = formData.get("stone_id") as string;
    console.log("sagy131.5", { stone_id });

    const stoneIdTag = Tag.generate(TagKey.StoneId, stone_id);
    console.log("sagy132", { stone_id }, { stoneIdTag });

    // get shopify producy by stone_id (which is tag).
    const queryString = generateStoneQuery({ stoneId: stone_id });
    console.log(
      "sagy133",
      { queryString },
      "supposed to see here valid query string to try in the graphiql",
    );

    const fetchedProductsByTag = await poolService.fetchProductsByTag(
      { admin },
      request,
      queryString,
    );

    if (!fetchedProductsByTag || fetchedProductsByTag.length !== 1) {
      throw new Error("❌ Expected exactly one product node in edges.");
    }

    const shopifyProductGid = fetchedProductsByTag[0]?.node?.id;
    console.log("sagy190", { shopifyProductGid });

    // get related rings by stone_id

    // for each related ring, remove the stone from

    // const products = await PoolService.fetchProductsByTag(
    //   { admin },
    //   request,
    //   queryString,
    // );

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

    relatedRingsProductGids.forEach(async (ringProductGid: string) => {
      await productService.removeValueFromListMetafield(
        { admin },
        request,
        ringProductGid,
        "relatedstones",
        "custom",
        shopifyProductGid,
      );
    });

    // const relatedRingsProductGids = JSON.parse(ringsMetafield.value);

    // relatedRingsProductGids.forEach(async (ringProductGid: string) => {
    //   console.log("sagy141", "delete this stone from here:", ringProductGid);
    // });

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
