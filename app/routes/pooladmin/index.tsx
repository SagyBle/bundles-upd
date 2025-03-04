import { useEffect, useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  Card,
  Button,
  TextField,
  InlineStack,
} from "@shopify/polaris";
import { useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "app/shopify.server";
import PoolController from "app/controllers/pool.controller";
import { fetchProductsByTag } from "app/services/pool.service";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return null;
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const url = new URL(request.url);
  const actionType = url.searchParams.get("action");

  if (request.method === "PUT" && actionType === "type1") {
    return PoolController.updatePoolDataType1(request);
  } else if (request.method === "PUT" && actionType === "type2") {
    return PoolController.updatePoolDataType2(request);
  } else if (request.method === "PUT" && actionType === "relatedstones") {
    return PoolController.updateRelatedStones(request);
  } else if (request.method === "POST" && actionType === "fetch-by-tags") {
    return PoolController.fetchProductsByTag(request);
  } else if (
    request.method === "POST" &&
    actionType === "generate-metafields-query"
  ) {
    return PoolController.generateRingQuery(request);
  }

  return { success: false, error: "Invalid request method" };
};

export default function PoolAdminPage() {
  const fetcher = useFetcher<any>();
  const shopify = useAppBridge();
  const [productId, setProductId] = useState("");
  const [relatedStones, setRelatedStones] = useState<string[]>([]);
  const [stoneInput, setStoneInput] = useState("");
  const [ringProductId, setRingProductId] = useState("");

  useEffect(() => {
    if (fetcher.data?.message) {
      shopify.toast.show(fetcher.data.message);
    }
  }, [fetcher.data, shopify]);

  const updatePoolDataType1 = () => {
    fetcher.submit({}, { method: "PUT", action: "/pooladmin?action=type1" });
  };

  const updatePoolDataType2 = () => {
    fetcher.submit({}, { method: "PUT", action: "/pooladmin?action=type2" });
  };

  const updateRelatedStones = () => {
    if (!productId.trim()) {
      shopify.toast.show("Please enter a ring product ID.");
      return;
    }
    if (relatedStones.length === 0) {
      shopify.toast.show("Please add at least one stone product ID.");
      return;
    }

    fetcher.submit(
      { productId, relatedStones: JSON.stringify(relatedStones) },
      { method: "PUT", action: "/pooladmin?action=relatedstones" },
    );
  };

  const addStone = () => {
    if (stoneInput.trim() && !relatedStones.includes(stoneInput.trim())) {
      setRelatedStones([...relatedStones, stoneInput.trim()]);
      setStoneInput("");
    }
  };

  const removeStone = (stoneId: string) => {
    setRelatedStones(relatedStones.filter((id) => id !== stoneId));
  };
  const fetchProductsByTag = () => {
    console.log("sagy10");

    fetcher.submit(
      { queryString: "(tag:Color_E) AND (tag:Shape_Marquise)" },
      { method: "POST", action: "/pooladmin?action=fetch-by-tags" },
    );
  };

  const generateQueryFromMetafields = () => {
    if (!ringProductId.trim()) {
      shopify.toast.show(
        "Please enter a valid ring product ID for metafields query.",
      );
      return;
    }
    fetcher.submit(
      { productId: ringProductId },
      { method: "POST", action: "/pooladmin?action=generate-metafields-query" },
    );
  };

  return (
    <Page>
      <Layout>
        <Layout.Section>
          <Card>
            <Text as="h2" variant="headingMd">
              Pool Management
            </Text>
            <Text as="p">Manage your pool settings here.</Text>
            <Button onClick={updatePoolDataType1}>Update Pool Type 1</Button>
            <Button onClick={updatePoolDataType2}>Update Pool Type 2</Button>
            <Button onClick={fetchProductsByTag}>Fetch Products By Tag</Button>
          </Card>
          <Card>
            <Text as="h2" variant="headingMd">
              Generate Query from Ring Metafields
            </Text>
            <Text as="p">
              Provide a ring product ID to generate a query based on its
              metafields.
            </Text>

            <TextField
              label="Ring Product ID for Metafields"
              value={ringProductId}
              onChange={(value) => setRingProductId(value)}
              autoComplete="off"
              placeholder="Enter ring product ID"
            />
            <Button onClick={generateQueryFromMetafields}>
              Generate Query from Metafields
            </Button>
          </Card>
          <Card>
            <Text as="h2" variant="headingMd">
              Update Related Stones
            </Text>
            <TextField
              label="Ring Product ID"
              value={productId}
              onChange={(value) => setProductId(value)}
              autoComplete="off"
              placeholder="Enter ring product ID"
            />
            <TextField
              label="Stone Product ID"
              value={stoneInput}
              onChange={(value) => setStoneInput(value)}
              autoComplete="off"
              placeholder="Enter stone product ID"
            />
            <Button onClick={addStone}>Add Stone</Button>

            {relatedStones.length > 0 && (
              <Card>
                <Text as="h3">Selected Stones:</Text>
                <InlineStack>
                  {relatedStones.map((stone, index) => (
                    <Button key={index} onClick={() => removeStone(stone)}>
                      {stone} ✖
                    </Button>
                  ))}
                </InlineStack>
              </Card>
            )}

            <Button onClick={updateRelatedStones}>Update Related Stones</Button>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
