import { ShopifyResourceType } from "app/enums/gid.enums";

import BundleService from "app/services/bundle.service";
import { extractIdFromGid, formatGid } from "app/utils/gid.util";
import { json } from "@remix-run/node";
import { checkRequestType } from "app/utils/auth.util";
import { ApiResponse } from "app/utils/apiResponse";
import { AdminShopifyService } from "app/services/api/adminShopify.api.service";
import { SessionShopifyService } from "app/services/api/sessionShopify.api.service";
import ProductService from "app/services/product.service";
import {
  extractProductIdsFromArray,
  filterRingOptions,
  formatBundleInput,
} from "app/utils/parsers/bundleInput.parser";

const createBundle = async (request: Request) => {
  const { isAdmin, admin, isSession, session } =
    await checkRequestType(request);

  // let firstProductId: string | null = null;
  // let secondProductId: string | null = null;
  let productsIds: string[] = []; // Ensure it's an array
  let title: string = "Default bundle";

  if (isAdmin) {
    const formData = await request.formData();
    // firstProductId = formData.get("firstProductId") as string | null;
    // secondProductId = formData.get("secondProductId") as string | null;

    // Parse productsIds safely
    const productsIdsRaw = formData.get("productsIds") as string | null;
    productsIds = productsIdsRaw ? JSON.parse(productsIdsRaw) : [];

    title = (formData.get("title") as string) || title;
  } else if (isSession) {
    const data = await request.json();
    // firstProductId = data?.firstProductId;
    // secondProductId = data?.secondProductId;
    productsIds = data?.productsIds ?? []; // Ensure it's an array

    if (data?.bundleTitle) {
      title = data?.bundleTitle;
    }
  } else {
    return json(ApiResponse.error("Unauthorized: No valid admin or session."), {
      status: 401,
    });
  }

  console.log("sagy2", { productsIds });

  if (productsIds.length < 2) {
    return json(ApiResponse.error("At least two product IDs are required"), {
      status: 400,
    });
  }

  console.log("sagy3");

  // Format product GIDs for Shopify
  const formattedProductsGids =
    // [
    // ...(firstProductId ? [firstProductId] : []),
    // ...(secondProductId ? [secondProductId] : []),
    productsIds
      // ]
      .map((productId) => formatGid(productId, ShopifyResourceType.Product));

  console.log("sagy14", formattedProductsGids);

  // Fetch product options dynamically for all product IDs
  const productOptionsPromises = formattedProductsGids.map((productGid) =>
    ProductService.getProductOptions({ admin, session }, request, {
      id: productGid,
    }),
  );

  const productOptionsResults = await Promise.all(productOptionsPromises);

  // Construct bundle components dynamically
  const bundleComponents = formattedProductsGids.map((productId, index) => ({
    quantity: 1,
    productId,
    optionSelections: productOptionsResults[index].map((option: any) => ({
      componentOptionId: option.componentOptionId,
      name: option.name,
      values: option.values,
    })),
  }));

  const bundleInput = {
    input: {
      title,
      components: bundleComponents, // Now dynamic for all products
    },
  };

  try {
    const bundleCreated =
      (await BundleService.createBundle(
        { admin, session },
        request,
        bundleInput,
      )) || "";

    // const apiService = isAdmin ? AdminShopifyService : SessionShopifyService;
    const variantId = await ProductService.getProductDefaultVariantId(
      { admin, session },
      request,
      {
        productId: bundleCreated,
      },
    );

    const variantIdNumeric = extractIdFromGid(variantId);

    // ✅ Return 200 Status on Success
    return json(
      ApiResponse.success("Bundle created successfully", {
        bundleCreated,
        variantId,
        variantIdNumeric,
      }),
      { status: 200 },
    );
  } catch (error: any) {
    console.error("❌ Error creating bundle:", error);

    return json(ApiResponse.error("Failed to create bundle", [error.message]), {
      status: 500,
    });
  }
};

const createBundleNew = async (request: Request) => {
  const { isAdmin, admin, isSession, session } =
    await checkRequestType(request);

  let title: string = "Default bundle";
  let input: any;
  if (isAdmin) {
    //
  } else if (isSession) {
    const data = await request.json();

    input = data?.input;
    console.log("sagy31", input);

    if (data?.bundleTitle) {
      title = data?.bundleTitle;
    }
  } else {
    return json(ApiResponse.error("Unauthorized: No valid admin or session."), {
      status: 401,
    });
  }

  if (!input) {
    throw new Error("No input received.");
  }
  const formattedInput = formatBundleInput(input);

  const stoneIds = extractProductIdsFromArray(formattedInput.stones);
  const extrasInBundleIds = extractProductIdsFromArray(
    formattedInput.extrasInBundle,
  );

  const formattedProductsGids = [...stoneIds, ...extrasInBundleIds];

  const productOptionsPromises = formattedProductsGids.map((productGid) =>
    ProductService.getProductOptions({ admin, session }, request, {
      id: productGid,
    }),
  );
  const productOptionsResults = await Promise.all(productOptionsPromises);

  const bundleComponents = formattedProductsGids.map((productId, index) => ({
    quantity: 1,
    productId,
    optionSelections: productOptionsResults[index].map((option: any) => ({
      componentOptionId: option.componentOptionId,
      name: option.name,
      values: option.values,
    })),
  }));

  const ringOptions = await ProductService.getProductOptions(
    { admin, session },
    request,
    {
      id: input.ring.productId,
    },
  );

  const filteredRingOptions = filterRingOptions(input.ring, ringOptions);

  const ringBundleComponents = {
    quantity: 1,
    productId: input.ring.productId,
    optionSelections: filteredRingOptions,
  };

  const bundleInput = {
    input: {
      title,
      components: [ringBundleComponents, ...bundleComponents],
    },
  };

  try {
    const bundleCreated =
      (await BundleService.createBundle(
        { admin, session },
        request,
        bundleInput,
      )) || "";

    const variantId = await ProductService.getProductDefaultVariantId(
      { admin, session },
      request,
      {
        productId: bundleCreated,
      },
    );

    const variantIdNumeric = extractIdFromGid(variantId);

    return json(
      ApiResponse.success("Bundle created successfully", {
        bundleCreated,
        variantId,
        variantIdNumeric,
      }),
      { status: 200 },
    );
  } catch (error: any) {
    console.error("❌ Error creating bundle:", error);

    return json(ApiResponse.error("Failed to create bundle", [error.message]), {
      status: 500,
    });
  }
};

export default { createBundle, createBundleNew };
