import { json } from "@remix-run/node";
import { cors } from "remix-utils/cors";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { checkRequestType } from "app/utils/auth.util";
import { ApiResponse } from "app/utils/apiResponse";

export async function loader({ request }: LoaderFunctionArgs) {
  // Handle preflight OPTIONS request
  if (request.method === "OPTIONS") {
    const response = json({ status: 200 });
    return await cors(request, response);
  }

  const response = json({
    success: true,
    message: "CORS fixed! 🚀",
  });

  return cors(request, response);
}

export async function action({ request }: ActionFunctionArgs) {
  // Test here

  // End Test here

  // ✅ Handle preflight OPTIONS request for CORS
  if (request.method === "OPTIONS") {
    return cors(request, json(ApiResponse.success("Preflight check passed")));
  }

  // ✅ Check request type (Admin or Session)
  const requestObject = await checkRequestType(request);
  console.log(
    "sagy400",
    "isAdmin:",
    requestObject.isAdmin,
    "isSession:",
    requestObject.isSession,
  );

  try {
    // ✅ Parse incoming request data
    const data = { data: "all good king" };

    // console.log("sagy11", data);

    return cors(
      request,
      json(
        ApiResponse.success("Request processed successfully", {
          // requestData: data,
          requestType: {
            isAdmin: requestObject.isAdmin,
            isSession: requestObject.isSession,
          },
        }),
      ),
    );
  } catch (error: any) {
    console.error("❌ Error processing request:", error);

    return cors(
      request,
      json(
        ApiResponse.error("Error processing request", [error.message]),
        { status: 500 }, // ✅ Correct placement of `status`
      ),
    );
  }
}
