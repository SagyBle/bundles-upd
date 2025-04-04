import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { Page, Layout, Text } from "@shopify/polaris";
import { authenticate } from "app/shopify.server";
import PoolController from "app/controllers/pool.controller";
import StoneForm from "./StoneForm";
import NodejsApiService from "app/services/api/nodejs.api.service";
import { parseBody } from "app/utils/parsers/body.parser";
import { useActionData } from "@remix-run/react";
import BBStoneForm from "./StoneForm";
import BBStonesList from "./BBStonesList";

export const loader = async ({ request }: LoaderFunctionArgs) => {};

export const action = async ({ request }: ActionFunctionArgs) => {
  const url = new URL(request.url);
  const actionType = url.searchParams.get("action");

  if (request.method === "POST" && actionType === "addStone") {
    const formData = await request.formData();
    const body = parseBody(formData);

    const response = await NodejsApiService.createBBStone(body);

    return response; // ✅ return the whole response with stone
  } else if (request.method === "POST" && actionType === "getStones") {
    const formData = await request.formData();
    const stoneType = formData.get("stoneType");
    if (stoneType !== "Lab Grown" && stoneType !== "Natural") {
      return { success: false, error: "Invalid stone type" };
    }
    const response = await NodejsApiService.fetchBBStones({ stoneType });
    // const response = await NodejsApiService.createBBStone(body);

    return response; // ✅ return the whole response with stone
  }

  return { success: false, error: "Invalid request method" };
};

// Minimal page component
export default function BBsInventoryAdmin() {
  const data = useActionData<typeof action>();

  return (
    <Page>
      <Layout>
        <Layout.Section>
          <Text as="h1" variant="heading2xl">
            BBsInventoryAdmin
          </Text>
        </Layout.Section>
        <Layout.Section>
          <BBStoneForm />
          <BBStonesList />
        </Layout.Section>
      </Layout>
    </Page>
  );
}
