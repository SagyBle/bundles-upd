import { ShopifyResourceType } from "app/enums/gid.enums";

import BundleService from "app/services/bundle.service";
import { extractIdFromGid, formatGid } from "app/utils/gid.util";
import { json } from "@remix-run/node";
import { checkRequestType } from "app/utils/auth.util";
import { ApiResponse } from "app/utils/apiResponse";
import { AdminShopifyService } from "app/services/api/adminShopify.api.service";
import { SessionShopifyService } from "app/services/api/sessionShopify.api.service";
import ProductService from "app/services/product.service";

const createBundle = async (request: Request) => {
  const { isAdmin, admin, isSession, session } =
    await checkRequestType(request);

  let firstProductId: string | null = null;
  let secondProductId: string | null = null;
  let title: string = "Default bundle";

  if (isAdmin) {
    const formData = await request.formData();
    firstProductId = formData.get("firstProductId") as string;
    secondProductId = formData.get("secondProductId") as string;
    title = (formData.get("title") as string) || title;
  } else if (isSession) {
    // ✅ Step 3: Extract data from JSON body
    const data = await request.json();
    firstProductId = data?.firstProductId;
    secondProductId = data?.secondProductId;

    if (data?.bundleTitle) {
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

  // ✅ Step 6: Convert IDs to Shopify GID format
  const firstProductGid = formatGid(
    firstProductId,
    ShopifyResourceType.Product,
  );
  const secondProductGid = formatGid(
    secondProductId,
    ShopifyResourceType.Product,
  );

  const [firstProductOptions, secondProductOptions] = await Promise.all([
    ProductService.getProductOptions({ admin, session }, request, {
      id: firstProductGid,
    }),
    ProductService.getProductOptions({ admin, session }, request, {
      id: secondProductGid,
    }),
  ]);

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

  try {
    const bundleCreated =
      (await BundleService.createBundle(
        { admin, session },
        request,
        bundleInput,
      )) || "";

    const apiService = isAdmin ? AdminShopifyService : SessionShopifyService;
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

export default { createBundle };
