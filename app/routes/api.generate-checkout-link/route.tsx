import { json } from "@remix-run/node";
import deactivationController from "app/controllers/deactivation.controller";
import { authenticate } from "app/shopify.server";
import { UpdateTypes } from "app/types/inventoryUpdates.types";

export const loader = async ({ request }: { request: Request }) => {
  const { cors } = await authenticate.admin(request);
  if (cors) {
    return cors(json({ ok: true }));
  }
  return json({ error: "Invalid method" }, { status: 405 });
};

export const action = async ({ request }: { request: Request }) => {
  console.log("sagy408");

  const { cors } = await authenticate.admin(request);
  //   const payload = await request.json();
  //   console.log("payload", payload);

  console.log("sagy409");

  const res = await deactivationController.deactivateStoneProduct(request);

  console.log("sagy411", res);

  //   const { variantId, quantity } = payload;

  // Example response — replace with real logic if needed
  return cors(json({ status: 200, message: "hell yes!" }));
};
