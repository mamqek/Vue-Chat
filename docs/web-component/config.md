# Configuration

The Vue-Chat web component supports several configuration options to customize its behavior.

| Option      | Description                                                                 | Default Value           |
| ----------- | --------------------------------------------------------------------------- | ----------------------- |
| service_url | The base URL of the chat service.                                           | "http://localhost:4000" |
| user_id     | The ID of the authenticated user.                                           | null                    |
| token       | The name of the JWT token used by the service.                              | "chat_token"            |
| container   | (only for `initChatWidget`) The DOM element where the widget will be mounted. | null                    |

### Service URL

The `service_url` is the endpoint where the chat service is hosted. For production, ensure this points to your backend service.

### User ID

The `user_id` is required for identifying the user. Avoid exposing it directly in production; consider using secure authentication methods.

### Token

The `token` is used for authentication and should match the configuration in your service backend.