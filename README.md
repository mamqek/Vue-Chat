# vue-chat

  "scripts": {
    // 1. Development mode: run both the Node service (in watch mode) and Vite dev server in parallel.
    "dev": "concurrently \"npm:dev:service\" \"npm:dev:web\"",

    // 1a. Dev script for the service alone.
    "dev:service": "tsnd --respawn --transpile-only service/src/index.ts",

    // 1b. Dev script for the web component alone.
    "dev:web": "vite",

    // 2. Build everything: compile service with tsc, build web component with Vite.
    "build": "npm run build:service && npm run build:web",

    "build:service": "tsc --project service/tsconfig.json",
    "build:web": "vite build",

    // 3. Start the compiled Node service (and serve or proxy the built web if needed).
    "start": "node service/dist/index.js"
  },


  ## Service override 

  2. Advanced Developer’s Customization
Now, an advanced developer using your package can import the ChatService class, create a subclass that overrides the desired method(s), and then replace the default instance.

For example:

ts
Copy
// customChatService.ts in the consuming project
import { ChatService } from 'your-chat-package/src/chatService';

class CustomChatService extends ChatService {
  async getAdvisors(authUserId: number): Promise<any[]> {
    // Custom logic: for example, filter advisors by a custom field.
    const userRepository = AppDataSource.getRepository(User);
    // Suppose the developer wants advisors who have a custom flag "isAdvisor" set to true.
    const advisors = await userRepository.find({ where: { isAdvisor: true } });
    for (const advisor of advisors) {
      const chatRepository = AppDataSource.getRepository(Chat);
      const count = await chatRepository.createQueryBuilder("chat")
        .where("chat.user1_id = :authUserId AND chat.user2_id = :advisorId", { authUserId, advisorId: advisor.id })
        .orWhere("chat.user1_id = :advisorId AND chat.user2_id = :authUserId", { authUserId, advisorId: advisor.id })
        .getCount();
      (advisor as any).has_chat = count > 0;
    }
    return advisors;
  }
}

export default new CustomChatService();
Then, in the consuming application, they can replace your default instance with their custom one:

ts
Copy
// In the consuming app's initialization code:
import { setChatServiceInstance } from 'your-chat-package/src/chatService';
import customChatService from './customChatService';

// Override the default ChatService instance.
setChatServiceInstance(customChatService);

// Now, when the web component uses the ChatService (via getChatServiceInstance),
// it will use the custom implementation.


or just to change fileter condiotn provide it to a web component like 

<chat-widget 
    auth-user='{"id":123,"name":"Alice"}' 
    advisor-filter='{"customProperty": "value"}'>
</chat-widget>

then it will be used as a filter on Users as userFilter
        const otherChatters = await userRepository.find({ where: this.userFilter || {} });    


## Database connection and driver 

// Determine the database type from an environment variable,
// defaulting to 'sqlite' for testing purposes.
const dbType = process.env.DB_TYPE || 'sqlite';

// Configure connection options.
// If using SQLite, the database file will be placed in the service directory.
const dataSourceOptions = {
  type: dbType as any, // Cast as any to bypass type conflicts when using env variables.
  database: dbType === 'sqlite' ? './chatdb.sqlite' : process.env.DB_NAME || 'chatdb',
  host: process.env.DB_HOST,     // For other DB types (e.g., postgres, mysql)
  port: process.env.DB_PORT ? +process.env.DB_PORT : undefined,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  entities: [Chat, ChatMessage, ChatMessageStatus, User],
  synchronize: true,  // Set to false in production environments.
  logging: false,
};


    "peerDependencies": {
        "mysql2": "^3.13.0",
        "pg": "^8.7.0"
    },







# Start

## Secure 

## Config 

In development you might use localhost:4000, but in production, you’d set SERVICE_URL to something like https://website.com (if using a reverse proxy) or https://website.com:4000 (if exposing the port directly).

setConfig({
  User: {
    entity: MyCustomUser, // Or omit if they are only changing the mapping on the default entity.
    field_mapping: {
      full_name: 'username', // Map the expected full_name to their "username" column.
      avatar: 'avatar',      // Keep as is if names match.
      bio: 'bio',            // Keep as is.
    }
  }
});


## User data

Chat service connects to the database of your project and retrieves required for chat user information (also see in User entity service\src\entities\User.ts)
- full_name (user name to be displayed)
- avatar (path to users profile picture)
- bio (~1 sentence of user description)

To do so, chat service requires id of the user which uses the chat. 
There are several ways to pass it: 



### Pass as attribute to web component

You can pass user-id as attribute to the component

<chat-widget 
    user-id="2"
</chat-widget>

Just like that web component will retrieve user information from connected DB. 
Package authenticates requests to service via JWT. It is advised to change config attributes from default values: 
- TOKEN_SECRET - your secret which is used for encoding
- JWT_ALGORITHM - algorithm used for encoding (default is HS256), not really necessary to change

### Pass requests through your authenticated route 

You can setup an authenticated route like "chat/*". It will receive all requests from web component and pass them to chat service. This approach counts on that your route will provide user object in the body of request when passing it. It will also omit service's authentication as it counts on your backend handling it. 

You need to set these properties in config:

- HOST - set it to '127.0.0.1' to only allow requests from the same machine (if your backed and chat service are run on the same server)
- SERVICE_URL - set it to url of your project + route you have set up f.e your project url is "https://website.com" and route is "chat/*", then set it to "https://website.com/chat"


### Connect service to your authentication system

Many frameworks store user information in session or cookies to access authenticated user in easy manner. You can choose method your project uses and configure service so it extracts user info from the same source.

#### JWT 
if your project uses JWT for authentication, from which user_id can be extracted. Package supports when this token is HttpOnly Cookie or if its stored in localStorage on the client. For now package doesnt support encryption (JWE) or Paseto. 

You need to set these properties in config:

- TOKEN_NAME - how your cookie is named or its attribute name in localStorage
- TOKEN_SECRET - your secret which is used for encoding
- JWT_ALGORITHM - algorithm used for encoding (default is HS256)

#### Session based authentication
If your project uses session based authentication, if you use f.e Laravel, Ruby on Rails, Django, Express, ASP.NET Core

You need to set these properties in config:

- TOKEN_NAME - how your cookie is named or its attribute name in localStorage
- sessionLookup - provide function which validates token and returns object with property id which is id of the authenticated user. Usually in such systems user info is retrieved by accession session table in database, depends on framework or your custom implementation

If the token used by session based autentication is also JWT, this approach can be used together with JWT approach with assumption that "id" property of JWT holds session token.

TODO: provide an example for laravel 


