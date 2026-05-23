import axios from "axios";

const api = axios.create({
  baseURL: " https://forge-fit.onrender.com/api",
  withCredentials: true
});

export default api;