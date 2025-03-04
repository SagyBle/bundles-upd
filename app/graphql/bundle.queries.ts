export const GRAPHQL_PRODUCT_BUNDLE_CREATE = `#graphql
      mutation ProductBundleCreate($input: ProductBundleCreateInput!) {
        productBundleCreate(input: $input) {
            productBundleOperation {
                id
                status
        }
        userErrors {
            message
            field
        }
    }
    }
      `;

export const GRAPHQL_PRODUCT_BUNDLE_OPERATION = `#graphql
      query productBundleOperation($id: ID!) {
        productOperation(id: $id) {
          ... on ProductBundleOperation {
            id
            status
            product {
              id
            }
            userErrors {
              field
              message
              code
            }
          }
        }
      }`;

export const GRAPHQL_NEW_UPDATE_PRODUCT_METAFIELDS = `#graphql
  mutation MetafieldsSet($metafields: [MetafieldsSetInput!]!) {
    metafieldsSet(metafields: $metafields) {
      metafields {
        key
        namespace
        value
        createdAt
        updatedAt
      }
      userErrors {
        field
        message
        code
      }
    }
  }
`;
