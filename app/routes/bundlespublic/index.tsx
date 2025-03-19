import { ActionFunctionArgs } from "@remix-run/node";
import bundleController from "app/controllers/bundle.controller";

export const action = async ({ request }: ActionFunctionArgs) => {
  if (request.method === "POST") {
    return bundleController.createBundleNew(request);
  }
  return { success: false };
};
