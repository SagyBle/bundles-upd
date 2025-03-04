import { useFetcher } from "@remix-run/react";
import {
  BlockStack,
  Card,
  InlineStack,
  Layout,
  Page,
  Text,
  Button,
} from "@shopify/polaris";
import { ShopifyResourceType } from "app/enums/gid.enums";
import { formatGid } from "app/utils/gid.util";
import React, { useEffect, useState } from "react";
import { action } from "../bundles";
import Stone from "app/components/Stone";

const RingPage = () => {
  const productFetcher = useFetcher<typeof action>(); // Fetcher for creating stone product
  const bundleFetcher = useFetcher<typeof action>(); // Fetcher for creating bundle

  const [ringId, setRingId] = useState("");
  const [stoneId, setStoneId] = useState("");
  const [bundleId, setBundleId] = useState("");
  const [timer, setTimer] = useState(0);
  const [isTiming, setIsTiming] = useState(false);

  useEffect(() => {
    setRingId(formatGid("10075106672927", ShopifyResourceType.Product));
  }, []);

  // ✅ Timer Logic - Starts counting when checkout is pressed
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTiming) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTiming]);

  // ✅ Update stoneId when a new product is created
  useEffect(() => {
    if (productFetcher.data?.product?.id) {
      const formattedStoneId = formatGid(
        productFetcher.data.product.id.replace("gid://shopify/Product/", ""),
        ShopifyResourceType.Product,
      );
      console.log("🆕 Updated stoneId:", formattedStoneId);
      setStoneId(formattedStoneId);
    }
  }, [productFetcher.data]);

  // ✅ Update bundleId when a bundle is successfully created & Stop Timer
  useEffect(() => {
    if (bundleFetcher.data?.success && bundleFetcher.data.message) {
      console.log("🎉 Bundle Created:", bundleFetcher.data.message);
      setBundleId(bundleFetcher.data.message);
      setIsTiming(false); // Stop the timer
    }
  }, [bundleFetcher.data]);

  const createStoneProduct = () => {
    productFetcher.submit({}, { method: "POST", action: "/products" });
  };

  const createBundle = () => {
    if (!stoneId) {
      console.error("❌ Stone product must be created before bundling.");
      return;
    }

    const formData = new FormData();
    formData.append("firstProductId", ringId);
    formData.append("secondProductId", stoneId);
    formData.append("title", `Ring & Stone Bundle ${new Date()}`);

    bundleFetcher.submit(formData, { method: "POST", action: "/bundles" });
  };

  const handleCheckout = async () => {
    console.log("🔗 Fixed ring productId:", ringId);
    console.log("📌 Generating stone product...");
    setTimer(0); // Reset timer
    setIsTiming(true); // Start timer
    createStoneProduct();
  };

  // Create a bundle once stone is created
  useEffect(() => {
    if (stoneId) {
      console.log("🛠 Creating Bundle...");
      createBundle();
    }
  }, [stoneId]);

  return (
    <Page>
      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            <Stone />
          </Layout.Section>
          <Layout.Section>
            <Card>
              <BlockStack gap="500">
                <Text as="h2" variant="headingMd">
                  Create, Edit and Delete Products
                </Text>
                <InlineStack gap="300">
                  <Button
                    onClick={handleCheckout}
                    disabled={productFetcher.state === "submitting"}
                  >
                    {productFetcher.state === "submitting"
                      ? "Creating..."
                      : "Checkout"}
                  </Button>
                </InlineStack>

                {/* ✅ Stopwatch Timer */}
                <Text as="p" variant="bodyMd">
                  ⏰ Timer: {timer} seconds
                </Text>

                {/* ✅ Display Ring ID */}
                {ringId && (
                  <Text as="p" variant="bodyMd">
                    💍 Ring Product ID: {ringId}
                  </Text>
                )}

                {/* ✅ Display Updated Stone ID */}
                {stoneId && (
                  <Text as="p" variant="bodyMd">
                    🪨 Stone Product ID: {stoneId}
                  </Text>
                )}

                {/* ✅ Display Newly Created Bundle ID */}
                {bundleId && (
                  <Text as="p" variant="bodyMd" tone="positive">
                    🎉 Bundle Created: {bundleId}
                  </Text>
                )}

                {/* ❌ Display Error Messages If Any */}
                {productFetcher.data?.error && (
                  <Text as="p" variant="bodyMd" tone="critical">
                    ❌ Error Creating Product: {productFetcher.data.error}
                  </Text>
                )}

                {bundleFetcher.data?.error && (
                  <Text as="p" variant="bodyMd" tone="critical">
                    ❌ Error Creating Bundle: {bundleFetcher.data.error}
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

export default RingPage;
