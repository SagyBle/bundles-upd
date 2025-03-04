export const GRAPHQL_SHOP_LOCATION = `#graphql 
query GetLocations {
  locations(first: 1) {
    edges {
      node {
        id
        name
      }
    }
  }
}`;
