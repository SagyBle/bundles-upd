import { TagKey } from "app/enums/tag.enums";

export class Tag {
  static generate<K extends TagKey>(key: K, value: string): string {
    if (!key || !value) {
      throw new Error("Both key and value are required to generate a tag.");
    }
    return `${key}_${value}`;
  }

  static generateInactiveStatus(reason: string): string {
    return this.generate(TagKey.Status, `inactive_${reason}`);
  }

  /**
   * Finds and returns all Status_inactive_* tags from a list of tags.
   * Example: "Status_inactive_api_update", "Status_inactive_manual_update"
   */
  static findInactiveStatusTags(tags: string[]): string[] {
    return tags.filter((tag) => tag.startsWith(`${TagKey.Status}_inactive_`));
  }

  /**
   * Parses a single tag string (e.g., "Color_E") into { key, value }
   */
  static parse(tag: string): { key: string; value: string } {
    const separatorIndex = tag.indexOf("_");

    if (separatorIndex === -1) {
      throw new Error(`Invalid tag format: ${tag}`);
    }

    const key = tag.slice(0, separatorIndex);
    const value = tag.slice(separatorIndex + 1);
    return { key: key.toLowerCase(), value }; // normalized to lowercase key
  }

  /**
   * Converts an array of tags into an object with keys and values
   */
  static parseMany(tags: string[]): Record<string, string> {
    const result: Record<string, string> = {};

    for (const tag of tags) {
      const { key, value } = this.parse(tag);
      result[key] = value;
    }

    return result;
  }
}
