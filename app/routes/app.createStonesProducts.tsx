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

  const [shape, setShape] = useState("");
  const [carat, setCarat] = useState("");
  const [color, setColor] = useState("");
  const [limit, setLimit] = useState("5"); // Default limit (between 0-10)
  const [stones, setStones] = useState<any[]>([]);
  const [selectedStones, setSelectedStones] = useState<{
    [key: string]: boolean;
  }>({});

  const handleLimitChange = (value: string) => {
    const numValue = Number(value);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 10) {
      setLimit(value);
    }
  };

  // Fetch Stones from API
  const fetchStones = async () => {
    console.log("Fetching stones with:", { shape, carat, color, limit });

    const response = await NodeJsApiService.fetchStones({
      shape,
      carat,
      color,
      limit,
    });

    if (response && Array.isArray(response)) {
      setStones(response);
      setSelectedStones(
        response.reduce((acc, stone) => ({ ...acc, [stone._id]: false }), {}),
      );
    } else {
      console.error("❌ Error: Unexpected response format", response);
      setStones([]);
    }
  };

  // Handle Checkbox Toggle
  const toggleStoneSelection = (id: string) => {
    setSelectedStones((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const uploadSelectedStones = () => {
    const selected = stones.filter((stone) => selectedStones[stone._id]);

    if (selected.length === 0) {
      console.warn("⚠️ No stones selected for upload.");
      return;
    }

    console.log("📦 Uploading Stones:", selected);

    // ✅ Convert selected stones to raw JSON
    const jsonBody = JSON.stringify(selected[0]);

    // ✅ Submit using fetcher.submit with JSON body
    fetcher.submit(jsonBody, {
      method: "POST",
      action: "/productsadmin",
      encType: "application/json", // ✅ Ensure raw JSON
    });
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
                  <>
                    <Checkbox
                      key={stone._id}
                      label={`🆔 ${stone.stone_id} | 💎 ${stone.shape} - ${stone.carat}ct - 🎨 ${stone.color}`}
                      checked={selectedStones[stone._id]}
                      onChange={() => toggleStoneSelection(stone._id)}
                    />
                  </>
                ))}
              </Box>
            </Card>
            <Box padding="400">
              <Button onClick={uploadSelectedStones}>UPLOAD</Button>
            </Box>
          </Layout.Section>
        )}
      </Layout>
    </Page>
  );
}
