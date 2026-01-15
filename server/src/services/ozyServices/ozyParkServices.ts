import axios from "axios";
import { ozyToken, urlOzyPark } from "./bearerService.js";

const token = ozyToken()

async function fetchContext() {
  const context = axios.create({
    baseURL: `${urlOzyPark}/api/v1/contexto`,
    timeout: 15000,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  const { data } = await context.get(""); 
  return data;
}

console.log(fetchContext())