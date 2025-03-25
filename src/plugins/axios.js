import axioss from "axios";
import { getCommonConfig } from "../../config/config.common.js"; // Use ESM syntax


// import { notify } from "@kyvg/vue3-notification";

let config = getCommonConfig();

axioss.defaults.xsrfCookieName = 'csrftoken'

const axiosInstance  = axioss.create({
    baseURL: config.SERVICE_URL,
    timeout: 15000,
    withCredentials: true,
    headers: {
        'X-CSRF-TOKEN': 'dummy-dev-token',
    }
})

// Axios interceptor to automatically attach JWT token from localStorage
axiosInstance.interceptors.request.use(config => {
    const token = localStorage.getItem( config.TOKEN_NAME);
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

axiosInstance.interceptors.response.use(
    response => {
        if (response?.data?.message) {
            notify({
                type: "success",
                title: response.data?.status || "Success",
                text: response.data.message,
            });
        }

        return response
    }, 
    error => {
        console.log(error)
        // let status = error.response?.status;
        // let message = error.response?.data?.message;
        // // if validation error 
        // if (status == 422 && error.response?.statusText == "Unprocessable Content") {
        //     message = error.response?.data?.errors
        // } else if (status == 401){
            
        // } else {
        //     notify({
        //         type: "error",
        //         title: `Error ${status}`,
        //         text: message,
        //     });
        // }
        
        // // Create an object with message, error, status code
        // const errorDetails = {
        //     message: message || 'An error occurred',
        //     error: error.response?.data?.error || error.response?.statusText,
        //     status: status || 500,
        // };

        // console.error(errorDetails)
        // return Promise.reject(errorDetails);
        return Promise.reject(error);
    }
);

export const axios = axiosInstance;
