import api from "../api/axiosInstance";

export async function fetchReservedCarIds(): Promise<string[]> {
  const response = await api.get("/cars/reserved-ids");
  return response.data?.data?.reservedCarIds ?? [];
}
