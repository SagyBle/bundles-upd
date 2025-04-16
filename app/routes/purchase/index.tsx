import { useState } from "react";
import { useFetcher } from "@remix-run/react";
import {
  BlockStack,
  Card,
  InlineStack,
  Layout,
  Page,
  Text,
  Button,
  TextField,
  Select,
} from "@shopify/polaris";
import purchaseController from "app/controllers/purchase.controller";
import { ActionFunctionArgs } from "@remix-run/node";
import { set } from "zod";

export const action = async ({ request }: ActionFunctionArgs) => {
  if (request.method === "POST") {
    console.log("sagy1");
    return purchaseController.purchaseStoneProduct(request);
  }
  return { success: false, error: "Invalid request method" };
};

const PurchasePage = () => {
  const fetcher = useFetcher<any>();

  // 🔹 States
  const [stoneId, setStoneId] = useState("");
  const [stoneType, setStoneType] = useState("");
  const [poNumber, setPoNumber] = useState("");
  const [vendor, setVendor] = useState<string | undefined>(undefined);

  // 🔸 Disable purchase unless all fields are filled
  const isFormIncomplete = !stoneId || !poNumber || !vendor;

  // 🔹 Handle Purchase Action
  const handlePurchase = () => {
    if (isFormIncomplete) return;

    const formData = new FormData();
    formData.append("stone_id", stoneId);
    formData.append("stone_type", stoneType as string);
    formData.append("po_number", poNumber);
    formData.append("vendor", vendor as string);

    fetcher.submit(formData, {
      method: "POST",
      action: "/purchase",
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
                  Commit stone purchase
                </Text>

                {/* 🔹 Stone ID input */}
                <TextField
                  label="Stone ID"
                  value={stoneId}
                  onChange={setStoneId}
                  autoComplete="off"
                />

                <Select
                  label="Stone Type"
                  options={[
                    { label: "Natural", value: "Natural" },
                    { label: "Labgrown", value: "Labgrown" },
                  ]}
                  value={stoneType}
                  onChange={setStoneType}
                  placeholder="Select Stone Type"
                />
                {/* 🔹 PO Number input */}
                <TextField
                  label="PO Number"
                  value={poNumber}
                  onChange={setPoNumber}
                  autoComplete="off"
                />

                {/* 🔹 Vendor Dropdown */}
                <Select
                  label="Vendor"
                  options={[
                    { label: "BB stone", value: "BB" },
                    { label: "Uni", value: "UNI" },
                  ]}
                  value={vendor}
                  onChange={setVendor}
                  placeholder="Select vendor"
                />

                {/* 🔹 Purchase Button */}
                <InlineStack gap="300">
                  <Button onClick={handlePurchase} disabled={isFormIncomplete}>
                    Purchase
                  </Button>
                </InlineStack>

                {/* ✅ Feedback Message */}
                {fetcher.data?.success && fetcher.data.message && (
                  <Text as="p" variant="bodyMd" tone="critical">
                    ✅ Product Purchased: {fetcher.data.message}
                  </Text>
                )}
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
};

export default PurchasePage;
