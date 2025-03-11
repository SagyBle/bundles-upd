import { authenticate } from "app/shopify.server";

export async function checkRequestType(request: Request) {
  let isAdmin = false;
  let admin: any = undefined;
  let isSession = false;
  let session: any = undefined;
  let isNodejsAuth = false;
  let nodejsAuth: any = undefined;

  try {
    // 🔹 Check for Admin Authentication (OAuth)
    const authAdmin = await authenticate.admin(request);
    admin = authAdmin?.admin || null;
    if (admin) isAdmin = true;
  } catch (error) {}

  try {
    // 🔹 Check for Session Authentication (App Proxy)
    const authSession = await authenticate.public.appProxy(request);
    session = authSession?.session || null;
    if (session) isSession = true;
  } catch (error) {}

  // 🔹 Check for Node.js API Token Authentication
  const accessToken = request.headers.get("X-Shopify-Access-Token");
  const shop = request.headers.get("X-Shopify-Shop-Domain");

  // TODO: Add here additional check.
  if (accessToken && shop) {
    isNodejsAuth = true;
    nodejsAuth = { accessToken, shop };
  }

  if (!isAdmin && !isSession && !isNodejsAuth) {
    console.error(
      "❌ Authentication FAILED: No valid session, admin, or Node.js access.",
    );
    throw new Error(
      "Unauthorized: No valid session, admin access, or API token.",
    );
  }

  return { isAdmin, isSession, isNodejsAuth, admin, session, nodejsAuth };
}
