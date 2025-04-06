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
import poolController from "app/controllers/pool.controller";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return null;
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const url = new URL(request.url);
  const actionType = url.searchParams.get("action");

  if (request.method === "PUT" && actionType === "syncUniLabgrown") {
    return poolController.syncStoneUpdates(request);
  } else if (request.method === "PUT" && actionType === "type1") {
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
  const [updatedRingData, setUpdatedRingData] = useState();
  const [updatedRingMetafields, setUpdatedRingMetafields] = useState();
  const [updatedRelatedStones, setUpdatedRelatedStones] = useState([]);

  useEffect(() => {
    if (fetcher?.data?.ring) {
      setUpdatedRingData(fetcher.data?.ring);
    }
    if (fetcher?.data?.relatedStones) {
      setUpdatedRelatedStones(fetcher.data?.relatedStones);
    }
    if (fetcher?.data?.parsedRingMetafields) {
      setUpdatedRingMetafields(fetcher.data?.parsedRingMetafields);
    }
  }, [fetcher.data, shopify]);

  useEffect(() => {
    if (fetcher.data?.message) {
      shopify.toast.show(fetcher.data.message);
    }
  }, [fetcher.data, shopify]);

  const handleSyncUniLabgrown = () => {
    fetcher.submit(
      {},
      { method: "PUT", action: "/pooladmin?action=syncUniLabgrown" },
    );
  };

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
              Sync Stone Inventories
            </Text>
            <Card>
              <Text as="p">Uni</Text>
              <Button onClick={handleSyncUniLabgrown}>Sync Uni Labgrown</Button>
            </Card>
          </Card>
          <Card>
            <Text as="h2" variant="headingMd">
              Pool Management
            </Text>
            <Text as="p">Manage your pool settings here.</Text>
            <Button onClick={updatePoolDataType1}>Update Pool Type 1</Button>
            <Button onClick={updatePoolDataType2}>Update Pool Type 2</Button>
            <Button onClick={fetchProductsByTag}>Fetch Products By Tag</Button>
          </Card>
          <br />
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
            {/* Display Updated Ring Data */}
            <br />
          </Card>
          <br />
          <Card>
            <Text as="h2" variant="headingMd">
              Assgin Related Stones To Ring
            </Text>
            <Text as="p">
              Provide a ring product ID to assign related stones based on ring
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
              Assign Related Stones
            </Button>
          </Card>
          {updatedRingData && (
            <Card>
              <Text as="h2" variant="headingMd">
                Ring Details
              </Text>
              <Card padding="400">
                <Text as="p">ID: {updatedRingData.id}</Text>
                <Text as="p">Title: {updatedRingData.title}</Text>
                <Text as="p">
                  Description: {updatedRingData.description || "No description"}
                </Text>
                <Text as="p">Vendor: {updatedRingData.vendor}</Text>
                <Text as="p">
                  Product Type: {updatedRingData.productType || "N/A"}
                </Text>
                <Text as="p">
                  Created At:{" "}
                  {new Date(updatedRingData.createdAt).toLocaleString()}
                </Text>
                <Text as="p">
                  Updated At:{" "}
                  {new Date(updatedRingData.updatedAt).toLocaleString()}
                </Text>
              </Card>
              {updatedRingData.images?.edges?.length > 0 && (
                <Card padding="400">
                  <Text as="h3">Images:</Text>
                  <InlineStack gap="300">
                    {updatedRingData.images.edges.map(
                      (image: any, index: number) => (
                        <img
                          key={index}
                          src={image.node.originalSrc}
                          alt="Ring Image"
                          width="100"
                        />
                      ),
                    )}
                  </InlineStack>
                </Card>
              )}
            </Card>
          )}
          {updatedRingMetafields && (
            <Card>
              <Text as="h2" variant="headingMd">
                Ring Metafields
              </Text>
              <Card padding="400">
                <Text as="h3">Stones Shapes:</Text>
                <InlineStack gap="300">
                  {updatedRingMetafields.stonesShapes?.map(
                    (shape: string, index: number) => (
                      <Card key={index}>
                        <Text as="p">{shape}</Text>
                      </Card>
                    ),
                  )}
                </InlineStack>

                <Text as="h3">Stones Weights:</Text>
                <InlineStack gap="300">
                  {updatedRingMetafields.stonesWeights?.map(
                    (weight: string, index: number) => (
                      <Card key={index}>
                        <Text as="p">{weight} ct</Text>
                      </Card>
                    ),
                  )}
                </InlineStack>

                <Text as="h3">Stones Colors:</Text>
                <InlineStack gap="300">
                  {updatedRingMetafields.stonesColors?.map(
                    (color: string, index: number) => (
                      <Card key={index}>
                        <Text as="p">{color}</Text>
                      </Card>
                    ),
                  )}
                </InlineStack>
              </Card>
            </Card>
          )}

          {/* Display Related Stones Data */}
          {updatedRelatedStones.length > 0 && (
            <Card>
              <Text as="h2" variant="headingMd">
                Related Stones Added to The Ring:
              </Text>
              <InlineStack gap="300">
                {updatedRelatedStones.map((stone: any, index: number) => (
                  <Card key={index}>
                    <Text as="p">ID: {stone.node.id}</Text>
                    <Text as="p">Title: {stone.node.title}</Text>
                    <Text as="p">
                      Description: {stone.node.description || "No description"}
                    </Text>
                    <Text as="p">
                      Tags: {stone.node.tags?.join(", ") || "No tags"}
                    </Text>
                  </Card>
                ))}
              </InlineStack>
            </Card>
          )}
        </Layout.Section>
      </Layout>
    </Page>
  );
}
