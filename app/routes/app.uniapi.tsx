import React, { useState } from "react";
import {
  Card,
  Layout,
  Page,
  Text,
  BlockStack,
  Button,
  List,
  Thumbnail,
  Checkbox,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import csvtojson from "csvtojson"; // ✅ Using csvtojson

const csvRawData = `stone_id,lab,active,reserved,reserved_till,carat,buy_price_per_carat,buy_price_total,shape,color,clarity,cut,polish,symmetry,flu,length,width,height,ratio,depth,table,origin,milky,shade,eye_clean,grading_url,video_url,sku_url,sku_url_2,sku_url_3,country,natural_diamond,estimated_delivery,updated_on
01-09746776,GIA,1,0,0,2.010,10833.33,21775.00,BR,G,VVS2,EX,EX,EX,NON,8.1200,8.1700,4.9400,0.99,60.7%,60%,Botswana,"No Milky",None,,,http://sl.customersapi.local.coolwebcode.com/vision/detail.php?d=9746776&surl=https://d305ukokfjetib.cloudfront.net/2024/12/18/grabber/imaged/13557480,https://d305ukokfjetib.cloudfront.net/2024/12/18/grabber/imaged/13557480/default.jpg,https://d305ukokfjetib.cloudfront.net/2024/12/18/grabber/imaged/13557480/heart.jpg,https://d305ukokfjetib.cloudfront.net/2024/12/18/grabber/imaged/13557480/arrow.jpg,India,1,"5-7 days",1734557595
01-09746789,GIA,1,0,0,2.010,13215.05,26562.26,BR,F,VVS2,EX,EX,EX,NON,8.1400,8.1800,4.9200,1.00,60.2%,60%,Angola,"No Milky",None,,,http://sl.customersapi.local.coolwebcode.com/vision/detail.php?d=9746789&surl=https://d305ukokfjetib.cloudfront.net/2024/12/18/grabber/imaged/13557493,https://d305ukokfjetib.cloudfront.net/2024/12/18/grabber/imaged/13557493/default.jpg,https://d305ukokfjetib.cloudfront.net/2024/12/18/grabber/imaged/13557493/heart.jpg,https://d305ukokfjetib.cloudfront.net/2024/12/18/grabber/imaged/13557493/arrow.jpg,India,1,"5-7 days",1734557595`;

export default function AdditionalPage() {
  const [stones, setStones] = useState<any[]>([]);
  const [chosenStones, setChosenStones] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGetFromApi = async () => {
    setLoading(true);
    setError(null);

    try {
      // ✅ Parse CSV using csvtojson
      const jsonArray = await csvtojson().fromString(csvRawData);

      // ✅ Store the converted JSON
      setStones(jsonArray);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Toggle stone selection
  const toggleStoneSelection = (stone: any) => {
    setChosenStones((prev) => {
      const isAlreadySelected = prev.find((s) => s.stone_id === stone.stone_id);
      if (isAlreadySelected) {
        return prev.filter((s) => s.stone_id !== stone.stone_id); // Remove if already selected
      } else {
        return [...prev, stone]; // Add new selection
      }
    });
  };

  // ✅ Function to handle uploading selected stones
  const handleUploadToShopify = () => {
    console.log("Uploading Stones to Shopify:", chosenStones);
  };

  return (
    <Page>
      <TitleBar title="Uni API" />
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="300">
              <Text as="p" variant="bodyMd">
                Click the button below to load stone data from the CSV.
              </Text>
            </BlockStack>
            <BlockStack gap="300">
              <Button onClick={handleGetFromApi} loading={loading}>
                {loading ? "Loading..." : "Load Stones"}
              </Button>
            </BlockStack>

            {/* ✅ New Button to Upload Stones */}
            <BlockStack gap="300">
              <Button
                onClick={handleUploadToShopify}
                disabled={chosenStones.length === 0}
              >
                Upload Stones to Shopify
              </Button>
            </BlockStack>

            {error && (
              <BlockStack gap="300">
                <Text as="p" variant="bodyMd" tone="critical">
                  Error: {error}
                </Text>
              </BlockStack>
            )}

            <BlockStack gap="300">
              {stones.length > 0 && (
                <List>
                  {stones.map((stone, index) => (
                    <List.Item key={index}>
                      <BlockStack gap="100">
                        <Checkbox
                          label="Select"
                          checked={chosenStones.some(
                            (s) => s.stone_id === stone.stone_id,
                          )}
                          onChange={() => toggleStoneSelection(stone)}
                        />
                        {/* ✅ Use `sku_url` as the image source */}
                        <Thumbnail
                          source={stone.sku_url}
                          alt={`Stone ${stone.stone_id}`}
                          size="large"
                        />
                        <Text as="p" variant="bodyMd">
                          <strong>ID:</strong> {stone.stone_id} |
                          <strong> Carat:</strong> {stone.carat} |
                          <strong> Color:</strong> {stone.color} |
                          <strong> Clarity:</strong> {stone.clarity} |
                          <strong> Price:</strong> ${stone.buy_price_total}
                        </Text>
                      </BlockStack>
                    </List.Item>
                  ))}
                </List>
              )}
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
