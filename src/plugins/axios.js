import axios from "axios";
import { getCommonConfig } from "../../config/config.common.js";


// import { notify } from "@kyvg/vue3-notification";

/**
 * Axios instance used for making HTTP requests.
 * Automatically attaches interceptors for request and response handling.
 */
let axiosInstance = createAxiosInstance();

/**
 * Creates a new Axios instance with the current configuration.
 * @returns {import('axios').AxiosInstance} A new Axios instance.
 */
function createAxiosInstance() {
    const config = getCommonConfig();
    const instance = axios.create({
        baseURL: config.SERVICE_URL,
        timeout: 15000,
        withCredentials: true,
        headers: {
            'X-CSRF-TOKEN': 'dummy-dev-token',
        },
    });

    attachInterceptors(instance);
    return instance;
}

/**
 * Updates the Axios instance with the latest configuration.
 * Useful when the configuration changes dynamically.
 */
export function updateAxiosInstance() {
    axiosInstance = createAxiosInstance();
}

function attachInterceptors(instance) {
    // Axios interceptor to automatically attach JWT token from localStorage
    instance.interceptors.request.use(config => {
        const token = localStorage.getItem(config.TOKEN_NAME);
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    }, error => {
        return Promise.reject(error);
    });

    instance.interceptors.response.use(
        response => {
            if (response?.data?.message) {
                // notify({
                //     type: "success",
                //     title: response.data?.status || "Success",
                //     text: response.data.message,
                // });
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
}

export { axiosInstance as axios };
