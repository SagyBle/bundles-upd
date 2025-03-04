const SHOPIFY_API_VERSION = process.env.SHOPIFY_API_VERSION || "2025-01";

export class ShopifyService {
  static async executeGraphQL<T>(
    auth: { admin?: any; session?: any }, // Pass authenticated session/admin
    query: string,
    variables?: Record<string, any>,
  ): Promise<T | null> {
    try {
      if (auth.admin) {
        return await ShopifyService.executeAdminGraphQL<T>(
          auth.admin,
          query,
          variables,
        );
      } else if (auth.session) {
        return await ShopifyService.executeSessionGraphQL<T>(
          auth.session,
          query,
          variables,
        );
      } else {
        throw new Error("Unauthorized: No valid admin or session.");
      }
    } catch (error) {
      console.error("Shopify API - GraphQL Request Error:", error);
      return null;
    }
  }

  private static async executeAdminGraphQL<T>(
    admin: any,
    query: string,
    variables?: Record<string, any>,
  ): Promise<T | null> {
    try {
      const response = await admin.graphql(query, { variables });
      const responseJson = await response.json();
      return responseJson.data || null;
    } catch (error) {
      console.error("Admin API - GraphQL Request Error:", error);
      return null;
    }
  }

  private static async executeSessionGraphQL<T>(
    session: any,
    query: string,
    variables?: Record<string, any>,
  ): Promise<T | null> {
    try {
      const response = await fetch(
        `https://${session.shop}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Shopify-Access-Token": session.accessToken || "",
          },
          body: JSON.stringify({ query, variables }),
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
