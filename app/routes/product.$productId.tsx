import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getProductById } from "app/services/product.service";
import { authenticate } from "app/shopify.server";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  const productId = params.productId;
  if (!productId) {
    throw new Response("Product ID is required", { status: 400 });
  }

  const product = await getProductById(
    request,
    `gid://shopify/Product/${productId}`,
  );

  return { product };
};

export default function ProductPage() {
  const { product } = useLoaderData<typeof loader>();

  return (
    <div>
      <h2>Product Details</h2>
      <pre>{JSON.stringify(product, null, 2)}</pre>
    </div>
  );
}
