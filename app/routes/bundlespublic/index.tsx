import { ActionFunctionArgs } from "@remix-run/node";
import bundleController from "app/controllers/bundle.controller";
import {
  GRAPHQL_PRODUCT_BUNDLE_CREATE,
  GRAPHQL_PRODUCT_BUNDLE_OPERATION,
} from "app/graphql/bundle.queries";
import { GRAPHQL_GET_PRODUCT_OPTIONS } from "app/graphql/product.queries";
import { authenticate } from "app/shopify.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  if (request.method === "POST") {
    // return bundleController.createBundle(request);
    return bundleController.createBundleNew(request);
  }
  return { success: false };
};
