import { useEffect, useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "app/shopify.server";

import ProductController from "app/controllers/product.controller";

export const action = async ({ request }: ActionFunctionArgs) => {
  const url = new URL(request.url);
  const actionType = url.searchParams.get("action");
  if (request.method === "POST" && actionType === "populate") {
    return ProductController.populateProduct(request);
  } else if (request.method === "POST") {
    return ProductController.createProduct(request);
  } else if (request.method === "DELETE") {
    return ProductController.deleteProduct(request);
  } else if (request.method === "PUT" && actionType === "status") {
    return ProductController.updateProductStatus(request);
  } else if (request.method === "PUT") {
    return ProductController.updateProduct(request);
  }

  return { success: false, error: "Invalid request method" };
};
