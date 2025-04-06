import { TagKey } from "app/enums/tag.enums";

export class Tag {
  static generate<K extends TagKey>(key: K, value: string): string {
    if (!key || !value) {
      throw new Error("Both key and value are required to generate a tag.");
    }
    return `${key}_${value}`;
  }

  // static generateNot<K extends TagKey>(key: K, value: string): string {
  //   return `NOT tag:${key}_${value}`;
  // }

  static generateInactiveStatus(reason?: string): string[] {
    const tags = [this.generate(TagKey.Status, "inactive")];

    if (reason) {
      tags.push(this.generate(TagKey.Status, `inactive_reason_${reason}`));
    }

    return tags;
  }

  /**
   * Finds and returns if Status_inactive tag exists in tags.
   */
  static hasInactiveStatus(tags: string[]): boolean {
    return tags.includes(`${TagKey.Status}_inactive`);
  }

  static findInactiveReasons(tags: string[]): string[] | null {
    const prefix = `${TagKey.Status}_inactive_reason_`;
    const reasons = tags
      .filter((tag) => tag.startsWith(prefix))
      .map((tag) => tag.replace(prefix, ""));

    return reasons.length > 0 ? reasons : null;
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
    console.log("sagy111", { key: key.toLowerCase(), value });

    return { key: key.toLowerCase(), value };
  }

  /**
   * Converts an array of tags into an object with keys and values
   */
  static parseMany(tags: string[]): Record<string, { value: string }> {
    const result: Record<string, { value: string }> = {};
    console.log("sagy109", { tags });

    for (const tag of tags) {
      const { key, value } = this.parse(tag);
      result[key] = { value };
    }

    console.log("sagy112", { result });

    return result;
  }

  static inferOriginalWeightTag(
    weight: number | string,
    range: number,
    weightDefs?: (string | number)[],
  ): string {
    // Parse the weight to number
    const parsedWeight =
      typeof weight === "string" ? parseFloat(weight) : weight;

    if (isNaN(parsedWeight)) {
      throw new Error(`Invalid weight input: ${weight}`);
    }

    if (!weightDefs || weightDefs.length === 0) {
      weightDefs = [
        "0.5",
        "1",
        "1.5",
        "2",
        "2.5",
        "3",
        "3.5",
        "4",
        "4.5",
        "5",
        "5.5",
        "6",
        "6.5",
        "7",
        "7.5",
        "8",
        "8.5",
        "9",
        "9.5",
        "10",
      ];
    }

    const parsedDefs = weightDefs.map((val) =>
      typeof val === "string" ? parseFloat(val) : val,
    );

    for (let i = 0; i < parsedDefs.length; i++) {
      const def = parsedDefs[i];
      if (parsedWeight >= def && parsedWeight <= def + range) {
        return JSON.stringify(def);
      }
    }

    throw new Error(
      `Weight ${parsedWeight} does not match any weight definition within range [def, def + ${range}]`,
    );
  }
}
