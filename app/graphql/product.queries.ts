// export const GRAPHQL_CREATE_PRODUCT = `#graphql
//   mutation CreateProduct($input: ProductCreateInput!) {
//     productCreate(product: $input) {
//       product {
//         id
//         title
//         handle
//         status
//         variants(first: 10) {
//           edges {
//             node {
//               id
//               price
//               inventoryItem{
//                 id
//               }
//               barcode
//               createdAt
//             }
//           }
//         }
//       }
//     }
//   }
// `;

export const GRAPHQL_NEW_UPDATE_PRODUCT = `#graphql
  mutation UpdateProduct($product: ProductUpdateInput!) { 
    productUpdate(product: $product) {  
      product {
        id
        title
        status    
        updatedAt  
        media(first: 10) {
          nodes {
            id
            alt
            mediaContentType
            preview {
              image {
                url 
              }
              status
            }
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const GRAPHQL_DELETE_PRODUCT = `#graphql
  mutation DeleteProduct($id: ID!) {
    productDelete(input: { id: $id }) {
      deletedProductId
      userErrors {
        field
        message
      }
    }
  }
`;

export const GRAPHQL_UPDATE_PRODUCT_VARIANTS = `#graphql
  mutation UpdateVariants($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
    productVariantsBulkUpdate(productId: $productId, variants: $variants) {
      productVariants {
        id
        price
        barcode
        createdAt
      }
    }
  }
`;

export const GRAPHQL_GET_PRODUCT_OPTIONS = `#graphql
  query GetProductOptions($id: ID!) {
    product(id: $id) { 
      options {
        id
        name
        values
      }
    }
  }
`;

export const GRAPHQL_GET_PRODUCT_BY_ID = `#graphql
  query GetProduct($id: ID!) {
    product(id: $id) { 
      id
      title
      description
      options {
        name
        values
      }
      variants(first: 10) {
        edges {
          node {
            id
            price
            inventoryItem {
              id
            }
            barcode
            createdAt
          }
        }
      }
    }
  }
`;

export const GRAPHQL_GET_PRODUCT_METAFIELDS = `#graphql
    query GetProductMetafields($input: ID!) {
      product(id: $input) {
        metafields(first: 10) {
          edges {
            node {
              id
              namespace
              key
              value
              type
              description
            }
          }
        }
      }
    }`;

export const GRAPHQL_GET_PRODUCT_DEFAULT_VARIANT_ID = `#graphql
  query GetProductDefaultVariantId($productId: ID!) {
    product(id: $productId) {
      id
      title
      variants(first: 1) {
        edges {
          node {
            id
          }
        }
      }
    }
  }
`;

export const GRAPHQL_UPDATE_RELATED_STONES_METAFIELD = `
  mutation UpdateRelatedStonesMetafield($productId: ID!, $relatedProductIds: String!) {
    metafieldsSet(
      metafields: [
        {
          ownerId: $productId
          namespace: "custom"
          key: "relatedstones"
          type: "list.product_reference"
          value: $relatedProductIds
        }
      ]
    ) {
      metafields {
        id
        key
        value
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const GRAPHQL_POPULATE_PRODUCT = `#graphql
  query PopulateProduct($id: ID!) {
    product(id: $id) {
      id
      title
      description
      handle
      tags
      vendor
      productType
      createdAt
      updatedAt
      images(first: 5) {
        edges {
          node {
            originalSrc
            altText
          }
        }
      }
      variants(first: 5) {
        edges {
          node {
            id
            title
            price
            sku
            barcode
            availableForSale
          }
        }
      }
      metafields(first: 10) {
        edges {
          node {
            id
            namespace
            key
            value
            type
            description
          }
        }
      }
    }
  }
`;

export const GRAPHQL_CREATE_PRODUCT_MEDIA = `#graphql
  mutation CreateProductMedia($productId: ID!, $media: [CreateMediaInput!]!) {
    productCreateMedia(productId: $productId, media: $media) {
      media {
        id
        preview {
          image {
            originalSrc
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const GRAPHQL_ADJUST_INVENTORY_QUANTITY = `#graphql
  mutation InventoryAdjustQuantities($input: InventoryAdjustQuantitiesInput!) {
    inventoryAdjustQuantities(input: $input) {
      userErrors {
        field
        message
      }
      inventoryAdjustmentGroup {
        createdAt
        reason
        referenceDocumentUri
        changes {
          name
          delta
        }
      }
    }
  }
`;

export const GRAPHQL_NEW_CREATE_PRODUCT = `#graphql
  mutation newproductCreate($product: ProductCreateInput!) {
    productCreate(product: $product) {
      product {
        id
        title
        variants(first: 1) {
          edges {
            node {
              id
              inventoryItem {
                id
              }
            }
          } 
        }
        options {
          id
          name
          position
          optionValues {
            id
            name
            hasVariants
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const GRAPHQL_UPDATE_INVENTORY_ITEM = `#graphql
  mutation UpdateInventoryItem($id: ID!, $input: InventoryItemInput!) {
    inventoryItemUpdate(id: $id, input: $input) {
      inventoryItem {
        id
        unitCost {
          amount
        }
        tracked
        countryCodeOfOrigin
        provinceCodeOfOrigin
        harmonizedSystemCode
        countryHarmonizedSystemCodes(first: 1) {
          edges {
            node {
              harmonizedSystemCode
              countryCode
            }
          }
        }
      }
      userErrors {
        message
      }
    }
  }
`;

export const GRAPHQL_UPDATE_LIST_METAFIELD = `#graphql
  mutation UpdateListMetafield(
    $productId: ID!,
    $valueToAssign: String!,
    $namespace: String!,
    $key: String!
  ) {
    metafieldsSet(
      metafields: [
        {
          ownerId: $productId
          namespace: $namespace
          key: $key
          type: "list.product_reference"
          value: $valueToAssign
        }
      ]
    ) {
      metafields {
        id
        key
        value
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const GRAPHQL_TAGS_ADD = `#graphql
  mutation addTags($id: ID!, $tags: [String!]!) {
    tagsAdd(id: $id, tags: $tags) {
      node {
        id
      }
      userErrors {
        message
      }
    }
  }
`;
