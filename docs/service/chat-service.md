# Chat Service

The AIOChatWC service handles all chat-related logic, including user filtering and message management.

## Customization

You can override the default chat service behavior by providing custom logic.

### Users filtering

In the widget there is a button to create new chats, you can change its retrieval logic of users to create chat with like:

```javascript
const myConfig = {
    user_filter : {"customProperty": "value"}
}
```

It will be applied like :

```javascript
getOtherChatters() {
    const otherChatters = await userRepository.find({ where: this.userFilter || {} });
}
```

You can see more on how filter should be structured [here](https://orkhan.gitbook.io/typeorm/docs/find-options#basic-options)

### Advanced Customization

For more advanced use cases, you also override existing methods or add new ones by extending the `ChatService` class:

```javascript
import { ChatService } from 'aio-chat-wc/service';

class CustomChatService extends ChatService {
  async getAdvisors(authUserId) {
    const advisors = await userRepository.find({ where: { isAdvisor: true } });
    return advisors;
  }
}

export default new CustomChatService();
```

For that, package exports following fields: 

```javascript
export { chatServiceInstance, setChatServiceInstance, getChatServiceInstance, ChatService };
```

where chatServiceInstance is an instance of default service, ChatService is the whole class and getters/setters to replace it 

You will need typescript installed and set you custom ChatService class before starting the service. 