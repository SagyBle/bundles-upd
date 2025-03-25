// import ApiService from "./ApiService"; // Adjust the import path as needed

import ApiService from "./general.api.service";

class NodeJsApiService extends ApiService {
  constructor() {
    super("http://localhost:3001");
  }

  async fetchStones<T>(params: Record<string, any> = {}): Promise<T> {
    return this.post<T>("/api/stonesApi/uni/test", params);
  }
  async createBBStone<T>(data: Record<string, any>): Promise<T> {
    console.log("sagy14", data.stoneType);
    console.log("sagy15", data);

    return this.post<T>("/api/stonesApi/bbInventory/createStone", data);
  }
}

export default new NodeJsApiService();
