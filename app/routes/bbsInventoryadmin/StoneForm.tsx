import { useState, useEffect } from "react";
import { useFetcher } from "@remix-run/react";
import { Card, TextField, Select, Button, InlineStack } from "@shopify/polaris";
import { useAppBridge } from "@shopify/app-bridge-react";

const shapeOptions = [
  { label: "Select Shape", value: "" },
  ...[
    "Round",
    "Princess",
    "Emerald",
    "Asscher",
    "Cushion",
    "Radiant",
    "Oval",
    "Pear",
    "Marquise",
    "Heart",
  ].map((label) => ({
    label,
    value: label,
  })),
];

const colorOptions = [
  { label: "Select Color", value: "" },
  ...["F", "G", "H", "I", "J", "K", "L", "M"].map((c) => ({
    label: c,
    value: c,
  })),
];

const cutOptions = [
  { label: "Select Cut", value: "" },
  ...["Excellent", "Very Good", "Good", "Fair", "Poor"].map((label) => ({
    label,
    value: label,
  })),
];

const clarityOptions = [
  { label: "Select Clarity", value: "" },
  ...[
    "FL",
    "IF",
    "VVS1",
    "VVS2",
    "VS1",
    "VS2",
    "SI1",
    "SI2",
    "I1",
    "I2",
    "I3",
  ].map((label) => ({
    label,
    value: label,
  })),
];

const labOptions = [
  { label: "Select Lab", value: "" },
  { label: "IGI", value: "IGI" },
  { label: "GIA", value: "GIA" },
  { label: "HRD", value: "HRD" },
];

export default function BBStoneForm() {
  const fetcher = useFetcher();
  const shopify = useAppBridge();

  const initialForm = {
    stoneSuffix: "",
    shape: "",
    weight: "",
    color: "",
    cut: "",
    clarity: "",
    lab: "",
    cost: "",
    price: "",
    compareAtPrice: "",
    imageUrl: "",
    stoneType: "Lab Grown",
    purchasedDate: "",
    isShopifyProduct: false,
  };

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (fetcher.data?.stone) {
      const { stone_id, weight, color, clarity } = fetcher.data.stone;
      shopify.toast.show(
        `✅ Stone ${stone_id} (${weight}ct, ${color}, ${clarity}) created successfully`,
        { duration: 5000 },
      );
      setForm(initialForm);
    }
  }, [fetcher.data]);

  const handleChange = (key: keyof typeof form) => (value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const setToday = () => {
    const today = new Date().toISOString().split("T")[0];
    setForm((prev) => ({ ...prev, purchasedDate: today }));
  };

  const fillMockData = () => {
    setForm({
      stoneSuffix: "123456",
      shape: "Princess",
      weight: "1.23",
      color: "F",
      cut: "Excellent",
      clarity: "VVS1",
      lab: "GIA",
      cost: "1200",
      price: "2200",
      compareAtPrice: "2800",
      imageUrl: "https://example.com/sample.jpg",
      stoneType: "Lab Grown",
      purchasedDate: new Date().toISOString().split("T")[0],
      isShopifyProduct: false,
    });
    setErrors([]);
  };

  const handleSubmit = () => {
    const requiredFields = [
      "stoneSuffix",
      "shape",
      "weight",
      "color",
      "clarity",
      "cost",
      "price",
      "imageUrl",
      "purchasedDate",
      ...(form.stoneType === "Lab Grown" ? ["lab"] : ["cut"]),
    ];

    const missingFields = requiredFields.filter(
      (key) => form[key as keyof typeof form].trim() === "",
    );

    if (missingFields.length > 0) {
      setErrors(missingFields);
      return;
    }

    setErrors([]);

    const prefix = form.stoneType === "Lab Grown" ? "BB-Lab-" : "BB-Nat-";
    const finalStone = {
      ...form,
      stone_id: `${prefix}${Date.now()}-${form.stoneSuffix.trim()}`,
    };
    delete finalStone.stoneSuffix;

    fetcher.submit(finalStone, {
      method: "POST",
      action: "/bbsInventoryadmin?action=addStone",
    });
  };

  const errorFor = (field: keyof typeof form) =>
    errors.includes(field) ? "This field is required" : undefined;

  return (
    <Card title="Add Stone">
      <InlineStack gap="0" wrap={false}>
        <Button
          fullWidth
          pressed={form.stoneType === "Lab Grown"}
          onClick={() =>
            setForm((prev) => ({ ...prev, stoneType: "Lab Grown" }))
          }
        >
          Lab Grown
        </Button>
        <Button
          fullWidth
          pressed={form.stoneType === "Natural"}
          onClick={() => setForm((prev) => ({ ...prev, stoneType: "Natural" }))}
        >
          Natural
        </Button>
      </InlineStack>

      <TextField
        label="Stone ID"
        prefix={form.stoneType === "Lab Grown" ? "BB-Lab-" : "BB-Nat-"}
        value={form.stoneSuffix}
        onChange={handleChange("stoneSuffix")}
        error={errorFor("stoneSuffix")}
      />

      <Select
        label="Shape"
        options={shapeOptions}
        value={form.shape}
        onChange={handleChange("shape")}
        error={errorFor("shape")}
      />

      <TextField
        label="Weight (ct)"
        type="text"
        value={form.weight}
        onChange={(value) => {
          if (/^\d*\.?\d*$/.test(value)) {
            setForm((prev) => ({ ...prev, weight: value }));
          }
        }}
        autoComplete="off"
        error={errorFor("weight")}
      />

      <Select
        label="Color"
        options={colorOptions}
        value={form.color}
        onChange={handleChange("color")}
        error={errorFor("color")}
      />

      <Select
        label="Clarity"
        options={clarityOptions}
        value={form.clarity}
        onChange={handleChange("clarity")}
        error={errorFor("clarity")}
      />

      {form.stoneType === "Lab Grown" ? (
        <Select
          label="Lab"
          options={labOptions}
          value={form.lab}
          onChange={handleChange("lab")}
          error={errorFor("lab")}
        />
      ) : (
        <Select
          label="Cut"
          options={cutOptions}
          value={form.cut}
          onChange={handleChange("cut")}
          error={errorFor("cut")}
        />
      )}

      <InlineStack gap="200">
        <TextField
          label="Purchased Date"
          type="date"
          value={form.purchasedDate}
          onChange={handleChange("purchasedDate")}
          error={errorFor("purchasedDate")}
        />
        <Button onClick={setToday}>Today</Button>
      </InlineStack>

      <TextField
        label="Cost"
        value={form.cost}
        onChange={handleChange("cost")}
        error={errorFor("cost")}
      />
      <TextField
        label="Price"
        value={form.price}
        onChange={handleChange("price")}
        error={errorFor("price")}
      />
      <TextField
        label="Compare at Price"
        value={form.compareAtPrice}
        onChange={handleChange("compareAtPrice")}
      />
      <TextField
        label="Image URL"
        value={form.imageUrl}
        onChange={handleChange("imageUrl")}
        error={errorFor("imageUrl")}
      />

      <InlineStack gap="400" align="end" blockAlign="center">
        <Button onClick={handleSubmit} variant="primary">
          Submit Stone
        </Button>
      </InlineStack>

      <InlineStack gap="200" align="start" blockAlign="center">
        <Button onClick={fillMockData} variant="secondary">
          Fill Mock Data
        </Button>
      </InlineStack>
    </Card>
  );
}
