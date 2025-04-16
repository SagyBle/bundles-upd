import { useEffect, useState } from "react";
import {
  reactExtension,
  useApi,
  AdminAction,
  BlockStack,
  Button,
  Text,
} from "@shopify/ui-extensions-react/admin";

// The target used here must match the target used in the extension's toml file (./shopify.extension.toml)
const TARGET = "admin.product-details.action.render";

export default reactExtension(TARGET, () => <App />);

function App() {
  const { i18n, close, data } = useApi(TARGET);
  const [productTitle, setProductTitle] = useState("");
  const [productStoneId, setProductStoneId] = useState("");

  useEffect(() => {
    (async function getProductInfo() {
      const getProductQuery = {
        query: `query Product($id: ID!) {
          product(id: $id) {
            title
            productType
            tags
          }
        }`,
        variables: { id: data.selected[0].id },
      };

      console.log("sagy4097");
      const res = await fetch("shopify:admin/api/graphql.json", {
        method: "POST",
        body: JSON.stringify(getProductQuery),
      });

      if (!res.ok) {
        console.error("Network error");
        return;
      }

      const productData = await res.json();
      const product = productData.data.product;

      console.log("sagy4099", { product });
      console.log("sagy4100", product.tags);

      setProductTitle(product.title);

      // ✅ Find tag with prefix "stone_id_"
      const stoneTag = product.tags.find((tag: string) =>
        tag.startsWith("stone_id_"),
      );

      if (stoneTag) {
        const stoneId = stoneTag.replace("stone_id_", "");
        console.log("✅ Found Stone ID:", stoneId);
        setProductStoneId(stoneId);
      } else {
        console.log("ℹ️ No stone_id_ tag found.");
      }
    })();
  }, [data.selected]);

  const handleGenerateCheckoutLink = async () => {
    const formData = new FormData();
    formData.append("productId", data?.selected?.[0]?.id ?? "");
    formData.append("stone_id", productStoneId);
    formData.append("reason", "manualUpdate");

    const res = await fetch("/api/generate-checkout-link", {
      method: "POST",
      body: formData, // ✅ pass FormData instead of JSON
    });

    console.log("sagy410", res);

    return res;
  };

  return (
    <AdminAction
      primaryAction={<Button onPress={close}>Done</Button>}
      secondaryAction={<Button onPress={close}>Close</Button>}
    >
      <BlockStack>
        <Text fontWeight="bold">
          {i18n.translate("welcome", { target: TARGET })}
        </Text>
        <Text>Sagy Current product: {productTitle}</Text>
        <Text>Sagy stone id: {productStoneId}</Text>

        <Button
          onPress={async () => {
            try {
              const res = await handleGenerateCheckoutLink();
              const result = await res.json();
              console.log("✅ Server Response:", result);
            } catch (err) {
              console.error("❌ Error sending request:", err);
            }

            close();
          }}
        >
          Run Test POST
        </Button>
      </BlockStack>
    </AdminAction>
  );
}
