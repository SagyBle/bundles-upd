import React from "react";
import { Card, BlockStack, Text } from "@shopify/polaris";

const Stone = () => {
  return (
    <Card>
      <BlockStack gap="500">
        <Text as="h2" variant="headingMd">
          Stone Details
        </Text>
        <Text as="p" variant="bodyMd">
          Fetched detailes from Pool.
        </Text>
      </BlockStack>
    </Card>
  );
};

export default Stone;
