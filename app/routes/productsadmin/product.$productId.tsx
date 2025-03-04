import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useFetcher } from "@remix-run/react";
import { Page, Card, BlockStack, Text, Button, Box } from "@shopify/polaris";
import { authenticate } from "app/shopify.server";
import { getProductById } from "app/services/product.service";
import { formatGid } from "app/utils/gid.util";
import { ShopifyResourceType } from "app/enums/gid.enums";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  const productId = params.productId;

  if (!productId) {
    throw new Response("Product ID is required", { status: 400 });
  }

  const productGid = formatGid(productId, ShopifyResourceType.Product);
  const product = await getProductById(request, { id: productGid });

  return { product };
};

export default function ProductPage() {
  const { product } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();

  const handleRefetchProduct = () => {
    fetcher.load(window.location.pathname);
  };

  return (
    <Page>
      <BlockStack gap="500">
        <Card>
          <Text as="h2" variant="headingMd">
            Product Details
          </Text>
          {product ? (
            <Box
              padding="400"
              background="bg-surface-active"
              borderWidth="025"
              borderRadius="200"
              borderColor="border"
            >
              <pre style={{ margin: 0 }}>
                {JSON.stringify(product, null, 2)}
              </pre>
            </Box>
          ) : (
            <Text>No product found</Text>
          )}
          <Button
            onClick={handleRefetchProduct}
            loading={fetcher.state === "loading"}
          >
            Refresh Product Data
          </Button>
        </Card>
      </BlockStack>
    </Page>
  );
}
