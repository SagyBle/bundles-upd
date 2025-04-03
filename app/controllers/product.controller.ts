import { TagKey, TagValue } from "app/enums/tag.enums";
import { ShopifyService } from "app/services/api/shopify.api.service";
import ProductService from "app/services/product.service";
import { Stone, StoneSchema } from "app/types/zod/schemas/stone.zod.schema";
import { checkRequestType } from "app/utils/auth.util";
import { generateDiamondTitle } from "app/utils/product.util";
import { Tag } from "app/utils/Tag.util";
import { z } from "zod";

const createProduct = async (request: Request) => {
  console.log("sagy123");

  try {
    const { admin, nodejsAuth } = await checkRequestType(request);
    let body = await request.json();

    if (!Array.isArray(body)) {
      body = [body];
    }

    console.log("sagy124", { body });

    const results = await Promise.all(
      body.map(async (bodyElement: any) => {
        try {
          const {
            shape,
            weight,
            color,
            cut,
            clarity,
            cost,
            price,
            compareAtPrice,
            media,
            stone_id,
          } = bodyElement;

          const title = generateDiamondTitle({
            weight,
            color,
            shape,
            cut,
            clarity,
          });

          const tags = [
            Tag.generate(TagKey.Shape, shape),
            Tag.generate(TagKey.Weight, weight),
            Tag.generate(TagKey.Color, color),
            Tag.generate(TagKey.Clarity, clarity),
            Tag.generate(TagKey.StoneId, stone_id),
          ];

          const metafields = [
            {
              namespace: "custom",
              key: "shape",
              value: shape,
              type: "single_line_text_field",
            },
            {
              namespace: "custom",
              key: "weight",
              value: weight,
              type: "single_line_text_field",
            },
            {
              namespace: "custom",
              key: "color",
              value: color,
              type: "single_line_text_field",
            },
            {
              namespace: "custom",
              key: "clarity",
              value: clarity,
              type: "single_line_text_field",
            },
          ];

          const product = await ProductService.newCreateProduct(
            { admin, nodejsAuth },
            request,
            { title, tags, metafields },
          );

          const variantId = product.variants.edges[0]?.node?.id;
          const inventoryItemId =
            product.variants.edges[0]?.node.inventoryItem.id;

          if (!variantId)
            throw new Error("Failed to retrieve product variant ID.");

          console.log("sagy149", product.id);

          const uploadedMedia = await ProductService.newCreateProductMedia(
            { admin, nodejsAuth },
            request,
            { productId: product.id, media },
          );

          if (!uploadedMedia) {
            throw new Error("❌ Failed to upload media.");
          }

          console.log("sagy150", uploadedMedia);

          const locationId = "gid://shopify/Location/103452410143";
          console.log("sagy300", { inventoryItemId, locationId, variantId });

          const updatedVariant = await ProductService.newUpdateProductVariants(
            { admin, nodejsAuth },
            request,
            {
              productId: product.id,
              variants: [
                {
                  id: variantId,
                  price,
                  compareAtPrice,
                  inventoryItem: { cost },
                },
              ],
            },
          );

          const updatedInventory =
            await ProductService.newAdjustInventoryQuantity(
              { admin, nodejsAuth },
              request,
              { inventoryItemId, availableDelta: 1, locationId },
            );

          const updatedInventoryItem =
            await ProductService.newUpdateInventoryItem(
              { admin, nodejsAuth },
              request,
              { id: inventoryItemId, tracked: true },
            );

          console.log("sagy302", updatedInventory);

          return { success: true, product, variant: updatedVariant };
        } catch (error: any) {
          console.error("Error creating product:", error);
          return { success: false, error: error.message };
        }
      }),
    );

    return results;
  } catch (error: any) {
    console.error("Error processing request:", error);
    return { success: false, error: error.message };
  }
};

const deleteProduct = async (request: Request) => {
  try {
    const { admin } = await checkRequestType(request);

    const formData = await request.formData();
    const productId = formData.get("productId") as string;
    if (!productId) throw new Error("Product ID is required to delete.");

    const deletedProductId = await ProductService.newDeleteProduct(
      { admin },
      request,
      {
        id: productId,
      },
    );

    return { success: true, deletedProductId };
  } catch (error: any) {
    console.error("Error deleting product:", error);
    return { success: false, error: error.message };
  }
};

const updateProduct = async (request: Request) => {
  try {
    const { admin } = await checkRequestType(request);

    const formData = await request.formData();
    const productId = formData.get("productId") as string;
    const newTitle = formData.get("newTitle") as string;

    if (!productId || !newTitle) {
      throw new Error("Product ID and new title are required.");
    }

    const updatedProduct = await ProductService.newUpdateProduct(
      { admin },
      request,
      {
        id: productId,
        title: newTitle,
      },
    );

    return { success: true, updatedProduct };
  } catch (error: any) {
    console.error("Error updating product:", error);
    return { success: false, error: error.message };
  }
};

const updateProductStatus = async (request: Request) => {
  try {
    const { admin } = await checkRequestType(request);

    const formData = await request.formData();
    const productId = formData.get("productId") as string;
    const status = formData.get("status") as string;

    // ✅ Type Guard: Ensure `status` is either "ACTIVE" or "DRAFT"
    if (!productId || !["ACTIVE", "DRAFT"].includes(status)) {
      throw new Error(
        "Product ID and valid status (ACTIVE or DRAFT) are required.",
      );
    }

    const updatedProduct = await ProductService.newUpdateProduct(
      { admin },
      request,
      {
        id: productId,
        status: status as "ACTIVE" | "DRAFT",
      },
    );

    return { success: true, updatedProduct };
  } catch (error: any) {
    console.error("Error updating product:", error);
    return { success: false, error: error.message };
  }
};

const populateProduct = async (request: Request) => {
  try {
    const { admin } = await checkRequestType(request);

    const formData = await request.formData();
    const productId = formData.get("productId") as string;
    if (!productId) throw new Error("Product ID is required to delete.");

    const populatedProduct = await ProductService.newPopulateProduct(
      { admin },
      request,
      {
        id: productId,
      },
    );

    return { success: true, populatedProduct };
  } catch (error: any) {
    console.error("Error populating product:", error);
    return { success: false, error: error.message };
  }
};

export default {
  createProduct,
  deleteProduct,
  updateProduct,
  updateProductStatus,
  populateProduct,
};
