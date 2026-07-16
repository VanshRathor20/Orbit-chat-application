import axios from "axios";

const axiosInstance = axios.create({
    baseURL: "https://orbit-backend-fsee.onrender.com",
});

export default axiosInstance;