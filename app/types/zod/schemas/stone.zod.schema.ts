import { z } from "zod";

const StoneIdSchema = z.string();
const MongoDbIdSchema = z.string();

const ShapeEnum = z.enum([
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
]);

const WeightSchema = z.string().refine(
  (value) => {
    return /^\d+(\.\d{1,2})?$/.test(value);
  },
  {
    message: "Weight must be a valid number with at most 2 decimal places",
  },
);

const ColorSchema = z.enum([
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
]);

const ClaritySchema = z.enum([
  "FL",
  "IF",
  "VVS1",
  "VVS2",
  "VS1",
  "VS2",
  "SI1",
  "SI2",
]);

const CutSchema = z.enum([
  "Excellent",
  "Very Good",
  "Good",
  "Fair",
  "Poor",
  "Ideal",
  "Below Average",
]);

const LabSchema = z.optional(z.enum(["GIA", "IGI", "HRD"]));

const PriceSchema = z.string();

const MediaItemSchema = z.object({
  alt: z.string(),
  mediaContentType: z.enum(["IMAGE", "VIDEO", "GIF"]),
  originalSource: z.string().url(),
});

const MediaSchema = z.array(MediaItemSchema);

export const StoneSchema = z.object({
  stone_id: StoneIdSchema,
  mongodb_id: MongoDbIdSchema,
  shape: ShapeEnum,
  weight: WeightSchema,
  color: ColorSchema,
  cut: CutSchema,
  clarity: ClaritySchema,
  lab: LabSchema,
  price: PriceSchema,
  media: MediaSchema,
});

export type Stone = z.infer<typeof StoneSchema>;
