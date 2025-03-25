import {
  Box,
  Card,
  Layout,
  Page,
  TextField,
  Button,
  Checkbox,
  Form,
  InlineStack,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useState } from "react";
import NodeJsApiService from "app/services/api/nodejs.api.service";
import { useFetcher } from "@remix-run/react";

export default function CreateStonesProducts() {
  const fetcher = useFetcher<any>();

  // ✅ Default values
  const [shape, setShape] = useState("OV");
  const [carat, setCarat] = useState("2.2");
  const [color, setColor] = useState("E");
  const [limit, setLimit] = useState("5"); // Default limit (between 0-10)
  const [stones, setStones] = useState<any[]>([]);
  const [selectedStones, setSelectedStones] = useState<{
    [stone_id: string]: boolean;
  }>({});

  const handleLimitChange = (value: string) => {
    const numValue = Number(value);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 10) {
      setLimit(value);
    }
  };

  // ✅ Fetch Stones from API
  const fetchStones = async () => {
    console.log("Fetching stones with:", { shape, carat, color, limit });

    const response = await NodeJsApiService.fetchUniStones({
      shape,
      carat,
      color,
      limit,
    });

    if (response && Array.isArray(response)) {
      setStones(response);

      // ✅ Maintain existing selections, default to false for new stones
      setSelectedStones((prev) =>
        response.reduce(
          (acc, stone) => ({
            ...acc,
            [stone.stone_id]: prev[stone.stone_id] || false,
          }),
          {},
        ),
      );
    } else {
      console.error("❌ Error: Unexpected response format", response);
      setStones([]);
    }
  };

  // ✅ Handle Checkbox Toggle (INDIVIDUAL SELECTION WORKS)
  const toggleStoneSelection = (stone_id: string) => {
    setSelectedStones((prev) => ({
      ...prev,
      [stone_id]: !prev[stone_id],
    }));
  };

  const uploadSelectedStones = () => {
    const selected = stones.filter((stone) => selectedStones[stone.stone_id]);

    if (selected.length === 0) {
      console.warn("⚠️ No stones selected for upload.");
      return;
    }

    console.log("📦 Uploading Stones:", selected);

    // ✅ Convert selected stones to raw JSON
    const jsonBody = JSON.stringify(selected);

    // ✅ Submit using fetcher.submit with JSON body
    fetcher.submit(jsonBody, {
      method: "POST",
      action: "/productsadmin",
      encType: "application/json", // ✅ Ensure raw JSON
    });
  };

  // ✅ Test function that logs "Hello, world!"
  const testFunction = () => {
    console.log("Hello, world!");
  };

  return (
    <Page>
      <TitleBar title="Create Stones Products Manually" />
      <Layout>
        <Layout.Section>
          <Card>
            <Form onSubmit={fetchStones}>
              <InlineStack gap="400">
                <TextField
                  label="Shape"
                  value={shape}
                  onChange={setShape}
                  autoComplete="off"
                />
                <TextField
                  label="Carat"
                  value={carat}
                  onChange={setCarat}
                  type="number"
                  autoComplete="off"
                />
                <TextField
                  label="Color"
                  value={color}
                  onChange={setColor}
                  autoComplete="off"
                />
                <TextField
                  label="Limit (0-10)"
                  value={limit}
                  onChange={handleLimitChange}
                  type="number"
                  min="0"
                  max="10"
                  autoComplete="off"
                />
                <Button submit>Get Stones</Button>
              </InlineStack>
            </Form>
          </Card>
        </Layout.Section>

        {stones.length > 0 && (
          <Layout.Section>
            <Card>
              <Box padding="400">
                {stones.map((stone) => (
                  <Checkbox
                    key={stone.stone_id}
                    label={`🆔 ${stone.stone_id} | 💎 ${stone.shape} - ${stone.carat}ct - 🎨 ${stone.color}`}
                    checked={selectedStones[stone.stone_id] || false}
                    onChange={() => toggleStoneSelection(stone.stone_id)}
                  />
                ))}
              </Box>
            </Card>
            <Box padding="400">
              <Button onClick={uploadSelectedStones}>UPLOAD</Button>
            </Box>
            <Box padding="400">
              <Button onClick={testFunction}>TEST</Button>
            </Box>
          </Layout.Section>
        )}
      </Layout>
    </Page>
  );
}
