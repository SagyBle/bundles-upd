import { Card, Layout, Text } from "@shopify/polaris";
import React from "react";

const Pool = () => {
  return (
    <div>
      {" "}
      <Layout>
        <Layout.Section>
          <Text as="h2" variant="headingMd">
            Stones Pool
          </Text>
          <Card></Card>
        </Layout.Section>
      </Layout>
    </div>
  );
};

export default Pool;
