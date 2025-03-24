import { useEffect, useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  Card,
  Button,
  BlockStack,
  Box,
  InlineStack,
  TextField,
} from "@shopify/polaris";
import { useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "app/shopify.server";

import { formatGid } from "app/utils/gid.util";
import { ShopifyResourceType } from "app/enums/gid.enums";

import ProductController from "app/controllers/product.controller";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return null;
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const url = new URL(request.url);
  const actionType = url.searchParams.get("action");
  if (request.method === "POST") {
    return await ProductController.createProduct(request);
  } else if (request.method === "DELETE") {
    return ProductController.deleteProduct(request);
  } else if (request.method === "PUT" && actionType === "status") {
    return ProductController.updateProductStatus(request);
  } else if (request.method === "PUT") {
    return ProductController.updateProduct(request);
  }

  return { success: false, error: "Invalid request method" };
};

export default function ProductsPage() {
  const [inputProductId, setInputProductId] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const fetcher = useFetcher<any>();
  const shopify = useAppBridge();

  useEffect(() => {
    if (fetcher.data?.product) {
      shopify.toast.show(
        `Product created with id: ${formatGid(fetcher.data.product.id, ShopifyResourceType.Product)}`,
      );
    }
    if (fetcher.data?.deletedProductId) {
      shopify.toast.show(
        `Product deleted with id: ${fetcher.data.deletedProductId}`,
      );
    }
  }, [fetcher.data, shopify]);

  const handleGenerateProduct = () => {
    fetcher.submit({}, { method: "POST", action: "/productsadmin" });
  };

  const handleDeleteProduct = () => {
    if (!inputProductId.trim()) return;
    const formData = new FormData();
    formData.append(
      "productId",
      formatGid(inputProductId, ShopifyResourceType.Product),
    );
    fetcher.submit(formData, { method: "DELETE", action: "/productsadmin" });
  };

  const handleUpdateProduct = () => {
    if (!inputProductId.trim() || !newTitle.trim()) return;
    const formData = new FormData();
    formData.append(
      "productId",
      formatGid(inputProductId, ShopifyResourceType.Product),
    );
    formData.append("newTitle", newTitle);
    fetcher.submit(formData, { method: "PUT", action: "/productsadmin" });
  };

  const handleUpdateProductStatus = () => {
    if (!inputProductId.trim()) return;
    const formData = new FormData();
    formData.append(
      "productId",
      formatGid(inputProductId, ShopifyResourceType.Product),
    );
    formData.append("status", "ACTIVE");
    fetcher.submit(formData, {
      method: "PUT",
      action: "/productsadmin?action=status",
    });
  };

  const handleTest = () => {
    console.log("test");
    fetcher.submit(null, {
      method: "POST",
      action: "/test",
    });
  };

  return (
    <Page>
      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="500">
                <Text as="h2" variant="headingMd">
                  Create, Edit and Delete Products
                </Text>
                <InlineStack gap="300">
                  <Button
                    loading={
                      fetcher.state === "loading" &&
                      fetcher.formMethod === "POST"
                    }
                    onClick={handleGenerateProduct}
                  >
                    Generate Product
                  </Button>
                  <TextField
                    label="Enter Product ID:"
                    value={inputProductId}
                    onChange={(value) => setInputProductId(value)}
                    autoComplete="off"
                    placeholder="e.g., 10066918539551"
                  />
                  <Button onClick={handleDeleteProduct}>Delete Product</Button>
                  <TextField
                    label="New Product Title:"
                    value={newTitle}
                    onChange={(value) => setNewTitle(value)}
                    autoComplete="off"
                    placeholder="Enter new title"
                  />
                  <Button onClick={handleUpdateProduct}>
                    Update Product Title
                  </Button>
                  <Button onClick={handleUpdateProductStatus}>
                    Update Product Status to ACTIVE
                  </Button>
                  <Button onClick={handleTest}>Test</Button>
                </InlineStack>
                {fetcher.data?.product && (
                  <Box
                    padding="400"
                    background="bg-surface-active"
                    borderWidth="025"
                    borderRadius="200"
                    borderColor="border"
                  >
                    <Text as="h3" variant="headingMd">
                      Created Product Data
                    </Text>
                    <Text as="p">
                      <b>Id:</b> {fetcher.data?.product?.id}
                    </Text>
                    <Text as="p">
                      <b>Title:</b> {fetcher.data?.product?.title}
                    </Text>
                  </Box>
                )}
                {fetcher.data?.deletedProductId && (
                  <Box
                    padding="400"
                    background="bg-surface-active"
                    borderWidth="025"
                    borderRadius="200"
                    borderColor="border"
                  >
                    <Text as="h3" variant="headingMd">
                      Deleted Product data:
                    </Text>
                    <Text as="p">
                      <b>Id:</b> {fetcher.data?.deletedProductId}
                    </Text>
                  </Box>
                )}
                {fetcher.data?.data && (
                  <Box
                    padding="400"
                    background="bg-surface-active"
                    borderWidth="025"
                    borderRadius="200"
                    borderColor="border"
                  >
                    <Text as="p">
                      <b>Test Response:</b> {fetcher.data?.data.data.data}
                    </Text>
                  </Box>
                )}
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
