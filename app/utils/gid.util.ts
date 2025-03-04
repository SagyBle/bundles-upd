import { ShopifyResourceType } from "app/enums/gid.enums";

/**
 * Converts a raw ID to a Shopify Global ID (GID).
 */
export function formatGid(
  id: string | number,
  resourceType: ShopifyResourceType,
): string {
  const idStr = String(id);

  if (idStr.startsWith("gid://shopify/")) {
    const existingId = idStr.split("/").pop();
    return `gid://shopify/${resourceType}/${existingId}`;
  }

  return `gid://shopify/${resourceType}/${idStr}`;
}

/**
 * Extracts the raw numeric ID from a Shopify GID.
 * If the ID is already a number, returns it unchanged.
 */
export function extractIdFromGid(gid: string | number): string {
  const idStr = String(gid);

  if (idStr.startsWith("gid://shopify/")) {
    return idStr.split("/").pop() || "";
  }

  return idStr;
}
