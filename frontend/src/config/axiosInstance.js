import axios from "axios";

const axiosInstance = axios.create({
    // baseURL: "https://orbit-backend-fsee.onrender.com",
    baseURL: "http://localhost:3000",
});

export default axiosInstance;