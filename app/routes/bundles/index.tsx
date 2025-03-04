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

  const [firstProductId, setFirstProductId] = useState("");
  const [secondProductId, setSecondProductId] = useState("");

  const isLoading = fetcher.state === "loading";

  const createBundleHandler = () => {
    const formData = new FormData();
    formData.append("firstProductId", firstProductId);
    formData.append("secondProductId", secondProductId);
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
            <TextField
              label="First Product ID"
              value={firstProductId}
              onChange={setFirstProductId}
              autoComplete="off"
              placeholder="Enter first product ID"
            />
            <TextField
              label="Second Product ID"
              value={secondProductId}
              onChange={setSecondProductId}
              autoComplete="off"
              placeholder="Enter second product ID"
            />
          </BlockStack>

          <Button
            loading={isLoading}
            onClick={createBundleHandler}
            disabled={!firstProductId.trim() || !secondProductId.trim()}
          >
            Create Bundle!
          </Button>
        </Card>
      </BlockStack>
    </Page>
  );
}
