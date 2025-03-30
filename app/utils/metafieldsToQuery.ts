import { TagKey } from "app/enums/tag.enums";
import { GraphQLFilterBuilder } from "./GraphQLFilterBuilder.util";
import { Tag } from "./Tag.util";

export function generateStoneQuery(filters: {
  stonesShapes?: string[];
  stonesWeights?: string[];
  stonesColors?: string[];
  stoneId?: string;
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

  // Convert Weights to Tag format and add as AND group (since a stone has one weight)
  if (filters.stonesWeights && filters.stonesWeights.length > 0) {
    const weightTags = filters.stonesWeights.map((weight) =>
      Tag.generate(TagKey.Weight, weight),
    );
    builder.addOrGroup(weightTags);
  }

  if (filters.stoneId) {
    builder.addAndGroup([Tag.generate(TagKey.StoneId, filters.stoneId)]);
  }

  return builder.build();
}
