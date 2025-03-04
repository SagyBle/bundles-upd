import { TagKey, TagValue } from "app/enums/tag.enums";
import { ShopifyService } from "app/services/api/shopify.api.service";
import ProductService from "app/services/product.service";
import { checkRequestType } from "app/utils/auth.util";
import { Tag } from "app/utils/Tag.util";

const createProduct = async (request: Request) => {
  try {
    const { admin } = await checkRequestType(request);

    // Type check: shape that we allow
    const shape = "Marquise";
    // Make sure Weight tag is down to 2.6
    const weight = "2.63";
    // Range Check - between D to Z, only one big letter
    const color = "G";
    // Type check - Approved cut
    const cut = "Excellent";
    // Type check - Approved Clarity
    const clarity = "VS1";

    const imageUrl = "";
    const alt = "";
    const price = "6867.00";
    // build util function title builder
    const title = `${weight}ct ${color} ${shape}, ${cut}, ${clarity}`;
    // Type check - Media, understnad which other media content types there are
    const media = [
      {
        alt: title,
        mediaContentType: "IMAGE",
        originalSource:
          "https://media.istockphoto.com/id/484234714/vector/example-free-grunge-retro-blue-isolated-stamp.jpg?s=612x612&w=0&k=20&c=97KgKGpcAKnn50Ubd8PawjUybzIesoXws7PdU_MJGzE=",
      },
    ];

    const tags = [
      Tag.generate(TagKey.Shape, shape),
      Tag.generate(TagKey.Weight, weight),
      Tag.generate(TagKey.Color, color),
    ];

    // Create shopify constants file with: "custom", "shape", "single_line_text_field"
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
    ];

    console.log("sagy3");

    const product = await ProductService.newCreateProduct({ admin }, request, {
      title,
      tags,
      metafields,
    });

    const variantId = product.variants.edges[0]?.node?.id;
    const inventoryItemId = product.variants.edges[0]?.node.inventoryItem.id;
    // TODO: build this function
    console.log("sagy149", product.id);

    // const uploadedMedia = await ProductService.createProductMedia(request, {
    //   productId: product.id,
    //   media,
    // });
    const uploadedMedia = await ProductService.newCreateProductMedia(
      { admin },
      request,
      {
        productId: product.id,
        media,
      },
    );

    if (!uploadedMedia) {
      throw new Error("❌ Failed to upload media.");
    }

    console.log("sagy150", uploadedMedia);

    // const locationId = await ShopService.getShopLocation(request);
    const locationId = "gid://shopify/Location/103452410143";
    console.log("sagy300", { inventoryItemId, locationId, variantId });

    if (!variantId) throw new Error("Failed to retrieve product variant ID.");
    const updatedVariant = await ProductService.newUpdateProductVariants(
      { admin },
      request,
      {
        productId: product.id,
        variants: [{ id: variantId, price }],
      },
    );

    const updatedInventory = await ProductService.newAdjustInventoryQuantity(
      { admin },
      request,
      {
        inventoryItemId,
        availableDelta: 1,
        locationId,
      },
    );

    const updatedInventoryItem = await ProductService.newUpdateInventoryItem(
      { admin },
      request,
      {
        id: inventoryItemId,
        tracked: true,
      },
    );

    console.log("sagy302", updatedInventory);

    return { success: true, product, variant: updatedVariant };
  } catch (error: any) {
    console.error("Error creating product or updating variant:", error);
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
