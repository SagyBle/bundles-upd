export const GRAPHQL_GET_PRODUCTS_BY_TAG = `#graphql
  query GetProductsByTag($query: String!) {
    products(first: 30, query: $query) {
      edges {
        node {
          id
          description
          title
          tags
        }
      }
    }
  }
`;
