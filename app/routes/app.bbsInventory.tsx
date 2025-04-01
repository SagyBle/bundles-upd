import React from "react";
import { Page } from "@shopify/polaris";

import { useLoaderData } from "@remix-run/react";
import PoolPage from "./pooladmin";
import BBsInventoryAdmin from "./bbsInventoryadmin";

const BBsInventory = () => {
  const collections: any = useLoaderData();
  console.log(collections, "collections");
  return (
    <Page>
      <BBsInventoryAdmin />
    </Page>
  );
};

export default BBsInventory;
