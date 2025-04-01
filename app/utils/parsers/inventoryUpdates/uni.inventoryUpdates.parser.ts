import { UpdateTypes } from "app/types/inventoryUpdates.types";

type RawInventoryRow = Record<string, string>;

export interface InventoryUpdate {
  stone_id: string;
  updateType: UpdateTypes;
  data: RawInventoryRow;
}

export function parseInventoryUpdates(
  rows: RawInventoryRow[],
): InventoryUpdate[] {
  return rows.map((row) => {
    const updateType =
      row.active === "0" ? UpdateTypes.inactive : UpdateTypes.details;

    return {
      stone_id: row.stone_id,
      updateType,
      data: row,
    };
  });
}
