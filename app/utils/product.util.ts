export const parseRingMetafields = (dataMetafields: Array<any>) => {
  let stonesShapes: string[] = [];
  let stonesWeights: string[] = [];
  let stonesColors: string[] = [];
  let stonesClarities: string[] = [];

  dataMetafields.forEach((metafield) => {
    if (!metafield?.key || !metafield?.value) return;

    switch (metafield.key) {
      case "stonesshapes":
        try {
          stonesShapes = JSON.parse(metafield.value);
        } catch (error) {
          console.error("Error parsing stonesshapes:", error);
        }
        break;
      case "stonesweights":
        try {
          stonesWeights = JSON.parse(metafield.value);
        } catch (error) {
          console.error("Error parsing stonesweights:", error);
        }
        break;
      case "stonesclarities":
        try {
          stonesClarities = JSON.parse(metafield.value);
        } catch (error) {
          console.error("Error parsing stonesclarities:", error);
        }
        break;
      case "stonescolors":
        try {
          stonesColors = JSON.parse(metafield.value);
        } catch (error) {
          console.error("Error parsing stonescolors:", error);
        }
        break;
    }
  });

  return { stonesShapes, stonesWeights, stonesColors, stonesClarities };
};

export function generateDiamondTitle({
  weight,
  color,
  shape,
  cut,
  clarity,
}: {
  weight: number | string;
  color: string;
  shape: string;
  cut: string;
  clarity: string;
}): string {
  return `${weight}ct ${color} ${shape}, ${cut}, ${clarity}`;
}
