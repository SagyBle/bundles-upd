export enum TagKey {
  Color = "Color",
  Shape = "Shape",
  Clarity = "Clarity",
  Lab = "Lab",
  Cut = "Cut",
  Weight = "Weight",
  StoneId = "stone_id",
  Status = "Status",
}

// Define allowed values for each key
export namespace TagValue {
  export enum Color {
    D = "D",
    E = "E",
    F = "F",
    G = "G",
    H = "H",
  }

  export enum Shape {
    Round = "Round",
    Oval = "Oval",
    Marquise = "Marquise",
    Pear = "Pear",
    Cushion = "Cushion",
  }

  export enum Clarity {
    FL = "FL",
    IF = "IF",
    VVS1 = "VVS1",
    VVS2 = "VVS2",
    VS1 = "VS1",
    VS2 = "VS2",
    SI1 = "SI1",
    SI2 = "SI2",
  }

  export enum Lab {
    GIA = "GIA",
    IGI = "IGI",
    HRD = "HRD",
  }

  export enum Cut {
    Excellent = "Excellent",
    VeryGood = "Very Good",
    Good = "Good",
    Fair = "Fair",
    Poor = "Poor",
  }
}
