// import shopify from './shopify'; // Adjust the import path accordingly
// import { authenticate } from './auth'; // Adjust the import path accordingly
import { authenticate } from "app/shopify.server";

export async function checkRequestType(request: Request) {
  let isAdmin = false;
  let admin: any = undefined;
  let isSession = false;
  let session: any = undefined;

  try {
    const authAdmin = await authenticate.admin(request);
    admin = authAdmin?.admin || null;
    if (admin) isAdmin = true;
  } catch (error) {}

  try {
    const authSession = await authenticate.public.appProxy(request);
    session = authSession?.session || null;
    if (session) isSession = true;
  } catch (error) {}

  if (!isAdmin && !isSession)
    console.log("Authentication FAILED, no session, no admin.");

  return { isAdmin, isSession, admin, session };
}
