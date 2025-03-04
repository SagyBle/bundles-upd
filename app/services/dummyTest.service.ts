import ApiService from "./api/general.api.service";

// ✅ Create instance of `ApiService` for dummyjson.com
const dummyJsonApi = new ApiService("https://dummyjson.com");

export default dummyJsonApi;
