import { TagKey, TagValue } from "app/enums/tag.enums";

export class Tag {
  static generate<K extends TagKey>(key: K, value: string): string {
    if (!key || !value) {
      throw new Error("Both key and value are required to generate a tag.");
    }

    // Format the tag
    return `${key}_${value}`;
  }
}
