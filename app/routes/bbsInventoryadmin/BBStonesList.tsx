import { useState, useEffect } from "react";
import { useFetcher } from "@remix-run/react";
import {
  Card,
  TextField,
  Select,
  Button,
  InlineStack,
  Text,
} from "@shopify/polaris";
import { useAppBridge } from "@shopify/app-bridge-react";
import { log } from "console";

type FetcherData = {
  stones: any[];
};

export default function BBStoneList() {
  const fetcher = useFetcher<FetcherData>();
  const shopify = useAppBridge();

  const [errors, setErrors] = useState<string[]>([]);
  const [stones, setStones] = useState<any[]>([]);

  const handleGeStones = async (stoneType: string) => {
    try {
      fetcher.submit(
        { stoneType },
        {
          method: "POST",
          action: "/bbsInventoryadmin?action=getStones",
        },
      );
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    console.log("fetcher.data", fetcher.data);
    const resStones: any = fetcher?.data?.stones;
    setStones(resStones);
  }, [fetcher.data]);

  return (
    <Card>
      <Text as="h2" variant="headingMd">
        Stones from Database
      </Text>
      <InlineStack gap="300" wrap={true}>
        {stones?.map((stone) => {
          return (
            <Card key={stone._id} padding="400">
              <InlineStack align="space-between">
                <Text as="p" variant="bodyMd" fontWeight="bold">
                  Stone ID: {stone.stone_id}
                </Text>
                <Text as="p">{stone.isShopifyProduct ? "🛒" : "❌"}</Text>
              </InlineStack>
              <Text as="p">Shape: {stone.shape}</Text>
              <Text as="p">Weight: {stone.weight} ct</Text>
              <Text as="p">Color: {stone.color}</Text>
              <Text as="p">Cut: {stone.cut}</Text>
              <Text as="p">Clarity: {stone.clarity}</Text>
              <Text as="p">Lab: {stone.lab}</Text>
              <Text as="p">Price: ${stone.price}</Text>
              <Text as="p">Cost: ${stone.cost}</Text>
            </Card>
          );
        })}
      </InlineStack>
      <InlineStack>
        <Button onClick={() => handleGeStones("Lab Grown")}>
          Fetch Lab Grown Stones
        </Button>
        <Button onClick={() => handleGeStones("Natural")}>
          Fetch Natural Stones
        </Button>
      </InlineStack>
    </Card>
  );
}
