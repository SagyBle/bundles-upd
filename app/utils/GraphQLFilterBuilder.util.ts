export class GraphQLFilterBuilder {
  private filters: string[] = [];

  /**
   * Adds a single tag filter (e.g., `tag:Color_D`).
   */
  addTagFilter(tag: string) {
    this.filters.push(tag);
    return this; // Enable method chaining
  }

  /**
   * Adds an OR group of tag filters (e.g., `(tag:Color_D OR tag:Shape_Oval)`).
   */
  addOrGroup(tags: string[]) {
    this.filters.push(`(${tags.map((tag) => `tag:${tag}`).join(" OR ")})`);
    return this;
  }

  /**
   * Adds an AND group of tag filters (e.g., `(tag:Shape_Marquise AND tag:Clarity_VS1)`).
   */
  addAndGroup(tags: string[]) {
    this.filters.push(`(${tags.map((tag) => `tag:${tag}`).join(" AND ")})`);
    return this;
  }

  /**
   * Builds and returns the GraphQL filter query.
   */
  build(): string {
    return this.filters.length > 0 ? this.filters.join(" AND ") : "";
  }
}
