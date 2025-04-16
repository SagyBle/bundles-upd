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
  Select,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useState } from "react";
import NodeJsApiService from "app/services/api/nodejs.api.service";
import { useFetcher } from "@remix-run/react";
import { StoneType, StoneTypes } from "app/enums/stoneTypes.enum";

export default function CreateStonesProducts() {
  const fetcher = useFetcher<any>();

  // ✅ Default values
  const [shape, setShape] = useState("Oval");
  // const [carat, setCarat] = useState("2.2");
  const [caratMin, setCaratMin] = useState("2.0");
  const [caratMax, setCaratMax] = useState("2.2");
  const [color, setColor] = useState("E");
  const [clarity, setClarity] = useState("VVS2");
  const [limit, setLimit] = useState("5"); // Default limit (between 0-10)
  const [stoneType, setStoneType] = useState<StoneType>(StoneTypes.LAB_GROWN);
  const [showShopifyListed, setShowShopifyListed] = useState(false);

  StoneTypes;

  const [stonesBB, setStonesBB] = useState<any[]>([]);
  const [stonesUni, setStonesUni] = useState<any[]>([]);
  const [selectedStones, setSelectedStones] = useState<{
    [stone_id: string]: boolean;
  }>({});

  const handleLimitChange = (value: string) => {
    const numValue = Number(value);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
      setLimit(value);
    }
  };

  // ✅ Fetch Stones from API
  const fetchStones = async () => {
    console.log("Fetching stones with:", {
      shape,
      caratMin,
      caratMax,
      color,
      clarity,
      limit,
      stoneType,
      showShopifyListed,
    });

    if (!isCaratRangeValid()) {
      console.error("❌ Invalid carat range: Min must be ≤ Max");
      return;
    }

    const responseUni: any = await NodeJsApiService.fetchUniStones({
      filters: {
        shape,
        caratMin,
        caratMax,
        color,
        clarity,
        limit,
        stoneType,
        showShopifyListed,
      },
    });
    console.log("sagy10", responseUni.stones);

    setStonesUni(responseUni.stones);

    const responseBB: any = await NodeJsApiService.fetchBBFilteredStones({
      filters: { shape, caratMin, caratMax, color, clarity, limit, stoneType },
    });
    setStonesBB(responseBB.stones);
  };

  // ✅ Handle Checkbox Toggle (INDIVIDUAL SELECTION WORKS)
  const toggleStoneSelection = (stone_id: string) => {
    setSelectedStones((prev) => ({
      ...prev,
      [stone_id]: !prev[stone_id],
    }));
  };

  const uploadSelectedStones = () => {
    const selected = [...stonesBB, ...stonesUni]?.filter(
      (stone: any) => selectedStones[stone.stone_id],
    );

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

  const isCaratRangeValid = () => {
    const min = parseFloat(caratMin);
    const max = parseFloat(caratMax);
    return !isNaN(min) && !isNaN(max) && min <= max;
  };

  // ✅ Test function that logs "Hello, world!"
  const testFunction = () => {
    console.log("Hello, world!");
  };

  const renderStoneCard = (stone: any, source: "BB" | "Uni") => {
    const selected = selectedStones[stone.stone_id] || false;
    const image = stone.media?.[0]?.originalSource;
    const isShopifyProduct = stone?.shopifyProduct?.isShopifyProduct;
    const shopifyProductSince =
      stone?.shopifyProduct?.createdAsShopifyProductAt;

    return (
      <Box
        key={stone.stone_id}
        padding="200"
        borderColor="border"
        borderWidth="050"
        borderRadius="100"
        background={isShopifyProduct ? "bg-subdued" : undefined}
      >
        <InlineStack gap="400" wrap={false} align="center">
          {image && (
            <img
              src={image}
              alt={stone.media?.[0]?.alt || stone.stone_id}
              width={80}
              height={80}
              style={{ objectFit: "cover", borderRadius: "8px" }}
            />
          )}
          <Box minWidth="0" width="100%">
            <Checkbox
              label={
                <div style={{ lineHeight: "1.5" }}>
                  <strong>{stone.shape}</strong> • {stone.weight}ct •{" "}
                  {stone.color} • {stone.clarity}
                  {stone.cut !== "Unknown" ? ` • ${stone.cut}` : ""} •{" "}
                  {stone.lab}
                  <br />
                  💰 <strong>${stone.price}</strong>{" "}
                  <span
                    style={{ textDecoration: "line-through", opacity: 0.6 }}
                  >
                    ${stone.compareAtPrice}
                  </span>{" "}
                  <span style={{ fontSize: "0.85em", opacity: 0.7 }}>
                    [{source}]
                  </span>
                  <br />
                  <span style={{ fontSize: "0.85em", opacity: 0.7 }}>
                    stone_id: {stone.stone_id}
                  </span>
                  {isShopifyProduct && (
                    <div
                      style={{
                        color: "#bf0711",
                        fontWeight: "bold",
                        fontSize: "0.7rem",
                      }}
                    >
                      Already in Shopify since{" "}
                      {new Date(shopifyProductSince).toLocaleString("en-GB", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </div>
                  )}
                </div>
              }
              checked={selected}
              onChange={() => toggleStoneSelection(stone.stone_id)}
              disabled={isShopifyProduct}
            />
          </Box>
        </InlineStack>
      </Box>
    );
  };

  return (
    <Page>
      <TitleBar title="Create Stones Products Manually" />
      <Layout>
        <Layout.Section>
          <Card>
            <Form onSubmit={fetchStones}>
              <InlineStack gap="400">
                <Select
                  label="Stone Type"
                  options={[
                    { label: "Lab Grown", value: StoneTypes.LAB_GROWN },
                    { label: "Natural", value: StoneTypes.NATURAL },
                  ]}
                  value={stoneType}
                  onChange={(value) => setStoneType(value as StoneType)}
                />
                <TextField
                  label="Shape"
                  value={shape}
                  onChange={setShape}
                  autoComplete="off"
                />
                <TextField
                  label="Carat Min (≥)"
                  value={caratMin}
                  onChange={setCaratMin}
                  type="number"
                  autoComplete="off"
                />
                <TextField
                  label="Carat Max (≤)"
                  value={caratMax}
                  onChange={setCaratMax}
                  type="number"
                  autoComplete="off"
                />
                <TextField
                  label="Color"
                  value={color}
                  onChange={setColor}
                  autoComplete="off"
                />
                <Select
                  label="Clarity"
                  options={[
                    { label: "All", value: "" },
                    { label: "IF", value: "IF" },
                    { label: "VVS1", value: "VVS1" },
                    { label: "VVS2", value: "VVS2" },
                    { label: "VS1", value: "VS1" },
                    { label: "VS2", value: "VS2" },
                    { label: "SI1", value: "SI1" },
                    { label: "SI2", value: "SI2" },
                    { label: "I1", value: "I1" },
                    { label: "I2", value: "I2" },
                  ]}
                  value={clarity}
                  onChange={setClarity}
                />
                <TextField
                  label="Limit (0-100)"
                  value={limit}
                  onChange={handleLimitChange}
                  type="number"
                  min="0"
                  max="100"
                  autoComplete="off"
                />
                <Checkbox
                  label="Show products that are already listed on Shopify"
                  checked={showShopifyListed}
                  onChange={(val) => setShowShopifyListed(val)}
                />
                <Button submit>Get Stones</Button>
              </InlineStack>
            </Form>
          </Card>
        </Layout.Section>

        {/* {stonesBB.length > 0 && (
          <Layout.Section>
            <Card>
              <Box padding="400">
                {stonesBB.map((stone) => (
                  <Checkbox
                    key={stone.stone_id}
                    label={`🆔 ${stone.stone_id} | 💎 ${stone.shape} - ${stone.carat}ct - 🎨 ${stone.color}`}
                    checked={selectedStones[stone.stone_id] || false}
                    onChange={() => toggleStoneSelection(stone.stone_id)}
                  />
                ))}
              </Box>
            </Card>
          </Layout.Section>
        )}

        {stonesUni.length > 0 && (
          <Layout.Section>
            <Card>
              <Box padding="400">
                {stonesUni.map((stone) => (
                  <Checkbox
                    key={stone.stone_id}
                    label={`🆔 ${stone.stone_id} | 💎 ${stone.shape} - ${stone.carat}ct - 🎨 ${stone.color}`}
                    checked={selectedStones[stone.stone_id] || false}
                    onChange={() => toggleStoneSelection(stone.stone_id)}
                  />
                ))}
              </Box>
            </Card>
          </Layout.Section>
        )} */}

        {stonesBB.length > 0 && (
          <Layout.Section>
            <Card>
              <Box padding="400">
                {stonesBB.map((stone) => renderStoneCard(stone, "BB"))}
              </Box>
            </Card>
          </Layout.Section>
        )}

        {stonesUni.length > 0 && (
          <Card>
            <Layout.Section>
              <Card>
                <Box padding="400" gap="400">
                  {stonesUni.map((stone) => renderStoneCard(stone, "Uni"))}
                </Box>
              </Card>
            </Layout.Section>
          </Card>
        )}
      </Layout>
      {(stonesBB.length > 0 || stonesUni.length > 0) && (
        <Card>
          <Layout.Section>
            <Box padding="400">
              <Button variant="primary" onClick={uploadSelectedStones}>
                📦 Upload Selected Stones to Shopify
              </Button>
            </Box>
          </Layout.Section>
        </Card>
      )}
    </Page>
  );
}
