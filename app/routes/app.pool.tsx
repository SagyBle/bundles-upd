import { Card, Layout, Page } from "@shopify/polaris";
import React from "react";

import { json } from "@remix-run/node";
import type { LoaderFunction } from "@remix-run/node";

import { apiVersion, authenticate } from "../shopify.server";
import { useLoaderData } from "@remix-run/react";
import Pool from "app/pool";
import PoolPage from "./pooladmin";

// export const loader: LoaderFunction = async ({ request }) => {
// };

const StonesPool = () => {
  const collections: any = useLoaderData();
  console.log(collections, "collections");
  return (
    <Page>
      {/* <Pool /> */}
      <PoolPage />
    </Page>
  );
};

export default StonesPool;
