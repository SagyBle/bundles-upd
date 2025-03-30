import { useEffect, useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  Button,
  InlineStack,
  TextField,
} from "@shopify/polaris";
import { useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "app/shopify.server";
import deactivationController from "app/controllers/deactivation.controller";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return null;
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const url = new URL(request.url);
  const actionType = url.searchParams.get("action");

  if (request.method === "POST" && actionType === "deactivate-stone") {
    deactivationController.deactivateStoneProduct(request);
    return {
      success: true,
      data: "sagy12 test success, deactivation-stone triggered1.",
    };
  }

  return { success: false, error: "Invalid request method" };
};

export default function Deactivation() {
  const fetcher = useFetcher<any>();
  const shopify = useAppBridge();
  const [stoneId, setStoneId] = useState("");

  useEffect(() => {
    if (fetcher?.data) {
      console.log("fetcher.data: ", fetcher.data);
    }
    shopify.toast.show(fetcher.data);
  }, [fetcher.data]);

  const handleDeactivate = () => {
    fetcher.submit(
      { stone_id: stoneId },
      { method: "POST", action: "/deactivation?action=deactivate-stone" },
    );
  };

  return (
    <Page title="Deactivate Stone">
      <Layout>
        <Layout.Section>
          <Card>
            <TextField
              label="Stone ID"
              value={stoneId}
              onChange={setStoneId}
              autoComplete="off"
              placeholder="Enter stone ID to deactivate"
            />
            <InlineStack gap="400" align="start">
              <Button onClick={handleDeactivate}>Deactivate Stone</Button>
            </InlineStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
