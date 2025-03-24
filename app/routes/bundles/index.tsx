import { useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import {
  Page,
  Button,
  Card,
  BlockStack,
  Text,
  TextField,
  List,
} from "@shopify/polaris";
import { authenticate } from "../../shopify.server";
import bundleController from "app/controllers/bundle.controller";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return null;
};

export const action = async ({ request }: ActionFunctionArgs) => {
  if (request.method === "POST") {
    console.log("sagy1");
    return bundleController.createBundle(request);
  }
  return { success: false, error: "Invalid request method" };
};

export default function BundlesPage() {
  const fetcher = useFetcher<typeof action>();

  // const [firstProductId, setFirstProductId] = useState("");
  // const [secondProductId, setSecondProductId] = useState("");
  const [productsIds, setProductsIds] = useState<string[]>([]);
  const [newProductId, setNewProductId] = useState("");

  const isLoading = fetcher.state === "loading";

  // Add product ID to the list
  const addProductIdHandler = () => {
    const trimmedId = newProductId.trim();
    if (trimmedId && !productsIds.includes(trimmedId)) {
      setProductsIds((prev) => [...prev, trimmedId]);
      setNewProductId(""); // Clear input after adding
    }
  };

  // Remove a product ID from the list
  const removeProductIdHandler = (id: string) => {
    setProductsIds((prev) => prev.filter((prodId) => prodId !== id));
  };

  // Submit form to create a bundle
  const createBundleHandler = () => {
    const formData = new FormData();
    // formData.append("firstProductId", firstProductId);
    // formData.append("secondProductId", secondProductId);
    formData.append("productsIds", JSON.stringify(productsIds)); // Stringify array
    formData.append("title", "bundle with metafields?");

    fetcher.submit(formData, {
      method: "POST",
      action: "/bundles",
    });
  };

  return (
    <Page>
      <BlockStack gap="500">
        <Card>
          <Text as="h2" variant="headingMd">
            Bundles Page
          </Text>

          <BlockStack gap="300">
            {/* First Product ID Input */}
            {/* <TextField
              label="First Product ID"
              value={firstProductId}
              onChange={setFirstProductId}
              autoComplete="off"
              placeholder="Enter first product ID"
            /> */}

            {/* Second Product ID Input */}
            {/* <TextField
              label="Second Product ID"
              value={secondProductId}
              onChange={setSecondProductId}
              autoComplete="off"
              placeholder="Enter second product ID"
            /> */}

            {/* Additional Product IDs Input */}
            <TextField
              label="Additional Product ID"
              value={newProductId}
              onChange={setNewProductId}
              autoComplete="off"
              placeholder="Enter product ID"
            />
            <Button
              onClick={addProductIdHandler}
              disabled={!newProductId.trim()}
            >
              Add Product ID
            </Button>

            {/* Display List of Added Product IDs */}
            {productsIds.length > 0 && (
              <Card>
                <Text as="p" variant="bodyMd">
                  Added Product IDs:
                </Text>
                <List>
                  {productsIds.map((id) => (
                    <List.Item key={id}>
                      {id}{" "}
                      <Button onClick={() => removeProductIdHandler(id)}>
                        Remove
                      </Button>
                    </List.Item>
                  ))}
                </List>
              </Card>
            )}
          </BlockStack>

          {/* Create Bundle Button */}
          <Button
            loading={isLoading}
            onClick={createBundleHandler}
            disabled={productsIds.length < 2}
          >
            Create Bundle!
          </Button>
        </Card>
      </BlockStack>
    </Page>
  );
}
