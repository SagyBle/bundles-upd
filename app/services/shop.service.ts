import { authenticate } from "app/shopify.server";
import { AdminShopifyService } from "./api/adminShopify.api.service";
import { checkRequestType } from "app/utils/auth.util";
import { GRAPHQL_SHOP_LOCATION } from "app/graphql/shop.queries";

export const getShopLocation = async (
  request: Request,
): Promise<{ id: string; name: string } | null> => {
  try {
    console.log("🚀 Fetching Shopify Location...");

    // ✅ Execute GraphQL Query via AdminShopifyService
    const data: any = await AdminShopifyService.executeGraphQL(
      request,
      GRAPHQL_SHOP_LOCATION,
    );

    console.log("📢 Query Response:", JSON.stringify(data, null, 2));

    // ✅ Extract first location ID and name
    const location = data?.locations?.edges?.[0]?.node || null;

    if (!location) {
      throw new Error("❌ No location found for this store.");
    }

    console.log("✅ Shopify Location:", location);
    return location; // { id: "gid://shopify/Location/123456", name: "Main Warehouse" }
  } catch (error) {
    console.error("❌ Error fetching shop location:", error);
    return null;
  }
};

export default { getShopLocation };
