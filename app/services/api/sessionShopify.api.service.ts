import { authenticate } from "app/shopify.server";

const SHOPIFY_API_VERSION = process.env.SHOPIFY_API_VERSION || "2025-01";

export class SessionShopifyService {
  static async executeGraphQL<T>(
    request: Request,
    query: string,
    variables?: Record<string, any>,
  ): Promise<T | null> {
    try {
      // Authenticate the session request
      const { session } = await authenticate.public.appProxy(request);

      if (!session) {
        throw new Error("Unauthorized: No valid session.");
      }

      // Send GraphQL request using session authentication
      const response = await fetch(
        `https://${session.shop}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Shopify-Access-Token": session.accessToken || "",
          },
          body: JSON.stringify({
            query,
            variables,
          }),
        },
      );

      const responseJson = await response.json();

      if (responseJson.errors) {
        console.error("Session API - GraphQL Errors:", responseJson.errors);
        return null;
      }

      return responseJson.data || null;
    } catch (error) {
      console.error("Session API - GraphQL Request Error:", error);
      return null;
    }
  }
}
