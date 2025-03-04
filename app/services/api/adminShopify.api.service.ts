import { authenticate } from "app/shopify.server";

export class AdminShopifyService {
  static async executeGraphQL<T>(
    request: Request,
    query: string,
    variables?: Record<string, any>,
  ): Promise<T | null> {
    try {
      const { admin } = await authenticate.admin(request);

      if (!admin) {
        throw new Error("Unauthorized: No valid admin session.");
      }

      // Execute the Shopify Admin GraphQL request
      const response = await admin.graphql(query, { variables });
      const responseJson = await response.json();

      return responseJson.data || null;
    } catch (error) {
      console.error("Admin API - GraphQL Request Error:", error);
      return null;
    }
  }
}
