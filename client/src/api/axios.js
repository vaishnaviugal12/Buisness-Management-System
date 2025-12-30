import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // automatically picks local or Render URL
  withCredentials: true, // if your backend uses cookies / JWT
});

export default api;
