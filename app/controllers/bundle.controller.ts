import { ShopifyResourceType } from "app/enums/gid.enums";

import BundleService from "app/services/bundle.service";
import {
  getProductDefaultVariantId,
  getProductOptions,
} from "app/services/product.service";
import { extractIdFromGid, formatGid } from "app/utils/gid.util";
import { parseJsonRequest } from "app/utils/parseJsonRequest";
import { stringify } from "querystring";
import { json } from "@remix-run/node";
import ProductController from "../controllers/product.controller";
import { checkRequestType } from "app/utils/auth.util";
import { ApiResponse } from "app/utils/apiResponse";
import { cors } from "remix-utils/cors";
import { AdminShopifyService } from "app/services/api/adminShopify.api.service";
import { SessionShopifyService } from "app/services/api/sessionShopify.api.service";

const createBundle = async (request: Request) => {
  // ✅ Step 1: Check if request is from Admin or Session

  const { isAdmin, admin, isSession, session } =
    await checkRequestType(request);

  let firstProductId: string | null = null;
  let secondProductId: string | null = null;
  let title: string = "public bundle"; // Default title

  if (isAdmin) {
    console.log("✅ Admin Request: Extracting from formData");
    console.log("sagy2");

    // ✅ Step 2: Extract data from formData
    const formData = await request.formData();
    firstProductId = formData.get("firstProductId") as string;
    secondProductId = formData.get("secondProductId") as string;
    title = (formData.get("title") as string) || title;
    console.log("sagy3", { firstProductId, secondProductId, title });
  } else if (isSession) {
    console.log("✅ Session Request: Extracting from JSON & Creating Product");

    // ✅ Step 3: Extract data from JSON body
    const data = await request.json();
    firstProductId = data?.firstProductId;
    secondProductId = data?.secondProductId;

    if (data?.bundleTitle) {
      // TODO: add here a function
      title = data?.bundleTitle;
    }
  } else {
    return json(ApiResponse.error("Unauthorized: No valid admin or session."), {
      status: 401,
    });
  }

  // ✅ Step 5: Validate Product IDs
  if (!firstProductId || !secondProductId) {
    return json(ApiResponse.error("Both product IDs are required"), {
      status: 400,
    });
  }

  console.log("sagy5", { firstProductId, secondProductId });

  // ✅ Step 6: Convert IDs to Shopify GID format
  const firstProductGid = formatGid(
    firstProductId,
    ShopifyResourceType.Product,
  );
  const secondProductGid = formatGid(
    secondProductId,
    ShopifyResourceType.Product,
  );

  console.log("sagy1000", firstProductGid, secondProductGid);

  // ✅ Step 7: Fetch Product Options
  const [firstProductOptions, secondProductOptions] = await Promise.all([
    getProductOptions(request, { id: firstProductGid }),
    getProductOptions(request, { id: secondProductGid }),
  ]);

  // ✅ Step 8: Prepare Bundle Input
  const bundleInput = {
    input: {
      title,
      components: [
        {
          quantity: 1,
          productId: firstProductGid,
          optionSelections: firstProductOptions.map((option: any) => ({
            componentOptionId: option.componentOptionId,
            name: option.name,
            values: option.values,
          })),
        },
        {
          quantity: 1,
          productId: secondProductGid,
          optionSelections: secondProductOptions.map((option: any) => ({
            componentOptionId: option.componentOptionId,
            name: option.name,
            values: option.values,
          })),
        },
      ],
    },
  };

  console.log("sagy1002", bundleInput);

  // ✅ Step 9: Create the Bundle
  try {
    const bundleCreated =
      (await BundleService.createBundle({ admin }, request, bundleInput)) || "";

    const apiService = isAdmin ? AdminShopifyService : SessionShopifyService;
    const variantId = await getProductDefaultVariantId(request, apiService, {
      productId: bundleCreated,
    });

    console.log("sagy23", variantId);
    const variantIdNumeric = extractIdFromGid(variantId);
    console.log("sagy24", variantIdNumeric);

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

export default { createBundle };
