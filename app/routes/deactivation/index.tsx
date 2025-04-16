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
  Select,
} from "@shopify/polaris";
import { useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "app/shopify.server";
import deactivationController from "app/controllers/deactivation.controller";
import { DeactivationReason } from "app/enums/deactivationReason";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return null;
};

export const action = async ({ request }: ActionFunctionArgs) => {
  console.log("sagy500", "recieved the request");

  const url = new URL(request.url);
  const actionType = url.searchParams.get("action");

  if (request.method === "POST" && actionType === "deactivate-stone") {
    await deactivationController.deactivateStoneProduct(request);
    return {
      success: true,
      data: "✅ Deactivation triggered.",
    };
  } else if (request.method === "POST" && actionType === "test") {
    console.log("sagy201");

    return {
      success: true,
      data: "✅ Deactivation triggered.",
    };
  }

  return { success: false, error: "Invalid request method" };
};

export default function Deactivation() {
  const fetcher = useFetcher<any>();
  const shopify = useAppBridge();

  const [stoneId, setStoneId] = useState("");
  const [reason, setReason] = useState(DeactivationReason.STONE_BOUGHT);

  useEffect(() => {
    if (fetcher?.data) {
      console.log("fetcher.data: ", fetcher.data);
      shopify.toast.show(fetcher.data);
    }
  }, [fetcher.data]);

  const handleDeactivate = () => {
    fetcher.submit(
      {
        stone_id: stoneId,
        reason,
      },
      {
        method: "POST",
        action: "/deactivation?action=deactivate-stone",
      },
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
            <Select
              label="Reason for Deactivation"
              options={[
                {
                  label: "Stone Bought",
                  value: DeactivationReason.STONE_BOUGHT,
                },
                {
                  label: "API Update",
                  value: DeactivationReason.API_UPDATE,
                },
                {
                  label: "Manual Update",
                  value: DeactivationReason.MANUAL_UPDATE,
                },
              ]}
              value={reason}
              onChange={(value) => setReason(value as DeactivationReason)}
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
