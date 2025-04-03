import { TagKey } from "app/enums/tag.enums";
import { GraphQLFilterBuilder } from "./GraphQLFilterBuilder.util";
import { Tag } from "./Tag.util";
import { DeactivationReason } from "app/enums/deactivationReason";

export function generateStoneQuery(filters: {
  stonesShapes?: string[];
  stonesWeights?: string[];
  stonesWeightsRange20?: string[];
  stonesColors?: string[];
  stonesClarities?: string[];
  stoneId?: string;
  active?: boolean;
}): string {
  const builder = new GraphQLFilterBuilder();

  // Convert Shapes to Tag format and add as OR group
  if (filters.stonesShapes && filters.stonesShapes.length > 0) {
    const shapeTags = filters.stonesShapes.map((shape) =>
      Tag.generate(TagKey.Shape, shape),
    );
    builder.addOrGroup(shapeTags);
  }

  // Convert Colors to Tag format and add as OR group
  if (filters.stonesColors && filters.stonesColors.length > 0) {
    const colorTags = filters.stonesColors.map((color) =>
      Tag.generate(TagKey.Color, color),
    );
    builder.addOrGroup(colorTags);
  }

  // Convert Weights to Tag format and add as OR group
  if (filters.stonesWeights && filters.stonesWeights.length > 0) {
    const weightTags = filters.stonesWeights.map((weight) =>
      Tag.generate(TagKey.Weight, weight),
    );
    builder.addOrGroup(weightTags);
  }

  // Convert Weights to Tag format and expand each weight from +0.00 to +0.20 in steps of 0.01
  if (filters.stonesWeightsRange20 && filters.stonesWeightsRange20.length > 0) {
    const expandedWeights: string[] = [];

    for (const weightStr of filters.stonesWeightsRange20) {
      const base = parseFloat(weightStr);
      for (let i = 0; i <= 20; i++) {
        const value = (base + i * 0.01).toFixed(2); // Ensure 2 decimal places
        expandedWeights.push(value);
      }
    }

    const weightTags = expandedWeights.map((weight) =>
      Tag.generate(TagKey.Weight, weight),
    );
    builder.addOrGroup(weightTags);
  }

  // Convert Clarities to Tag format and add as AND group (since a stone has one clarity)
  if (filters.stonesClarities && filters.stonesClarities.length > 0) {
    const clarityTags = filters.stonesClarities.map((clarity) =>
      Tag.generate(TagKey.Clarity, clarity),
    );
    builder.addOrGroup(clarityTags);
  }

  if (filters.stoneId) {
    builder.addAndGroup([Tag.generate(TagKey.StoneId, filters.stoneId)]);
  }

  console.log("sagy14");

  if (filters.active) {
    const notInactiveTag = Tag.generate(TagKey.Status, "inactive");
    // TODO: add the not from the GraphQLFilterBuilder
    builder.addAndGroup([notInactiveTag], { not: true });
  }

  return builder.build();
}
