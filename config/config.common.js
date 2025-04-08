// config.common.js
const defaultCommonConfig = {
    SERVICE_URL: "http://localhost:4000",
    TOKEN_NAME: "chat_token",
    CONTAINER: null,
    USER_ID: null,
};

let currentCommonConfig = { ...defaultCommonConfig };

export function setCommonConfig(newConfig) {
    currentCommonConfig = { ...currentCommonConfig, ...newConfig };
}

export function getCommonConfig() {
  return currentCommonConfig;
}
