// import ApiService from "./ApiService"; // Adjust the import path as needed

import ApiService from "./general.api.service";

class NodeJsApiService extends ApiService {
  constructor() {
    super("http://localhost:3001");
  }

  async fetchUniStones<T>(params: Record<string, any> = {}): Promise<T> {
    return this.post<T>("/api/stonesApi/uni/test", params);
  }
  async fetchBBStones<T>(params: Record<string, any> = {}): Promise<T> {
    return this.get<T>("/api/stonesApi/bbInventory/getStones", params);
  }
  async fetchBBFilteredStones<T>(params: Record<string, any> = {}): Promise<T> {
    return this.post<T>("/api/stonesApi/bbInventory/getFilteredStones", params);
  }

  async createBBStone<T>(data: Record<string, any>): Promise<T> {
    return this.post<T>("/api/stonesApi/bbInventory/createStone", data);
  }
  async syncUniUpdates<T>(data: Record<string, any>): Promise<T> {
    return this.put<T>("/api/stonesApi/uni/fetch-inventory-updates", data);
  }

  async purchaseStone<T>(data: Record<string, any>): Promise<T> {
    return this.post<T>("/api/purchase/stone", data);
  }
}

export default new NodeJsApiService();
