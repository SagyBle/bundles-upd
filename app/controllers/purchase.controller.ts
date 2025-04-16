import { Logger } from "app/logger/Logger";
import { checkRequestType } from "app/utils/auth.util";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import nodejsApiService from "app/services/api/nodejs.api.service";
import deactivationController from "./deactivation.controller";

const purchaseStoneProduct = async (request: Request) => {
  Logger.info("purchaseStoneProduct started");

  try {
    const { admin } = await checkRequestType(request);

    // Support from inventoryUpdate (preferred)
    let stone_id: string | null = null;
    let vendor: string | null = null;
    let po_number: string | null = null;

    console.log("sagy902", "bad");
    // Fallback to formData
    const formData = await request.formData();
    stone_id = formData.get("stone_id") as string;
    vendor = formData.get("vendor") as string;
    po_number = formData.get("po_number") as string;

    if (!stone_id || !vendor || !po_number) {
      throw new Error("Missing required stone_id, vendor or po_number.");
    }

    // send a purchse request to node server which will:
    const response = await nodejsApiService.purchaseStone({
      stone_id,
      vendor,
      po_number,
    });

    console.log("sagy321", response);

    const decativatedStone =
      await deactivationController.deactivateStoneProduct(request);

    Logger.info("purchaseStoneProduct ends successfully");

    return {
      success: true,
      message: "Purchase request sent successfully.",
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export default {
  purchaseStoneProduct,
};
