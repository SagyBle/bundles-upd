import { json } from "@remix-run/node";
import { cors } from "remix-utils/cors";
import { ApiResponse } from "./apiResponse";

export async function parseJsonRequest(request: Request) {
  try {
    const data = await request.json();
    return { data, error: null };
  } catch (error) {
    console.error("❌ Error parsing request body:", error);

    const errorResponse = cors(
      request,
      json(ApiResponse.error("Invalid JSON format or empty request body"), {
        status: 400,
      }),
    );

    return { data: null, error: errorResponse };
  }
}
