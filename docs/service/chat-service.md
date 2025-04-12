# Chat Service

The Vue-Chat service handles all chat-related logic, including user filtering and message management.

## Customization

You can override the default chat service behavior by providing custom logic. For example, to filter users:

```javascript
<chat-widget 
    auth-user='{"id":123,"name":"Alice"}' 
    advisor-filter='{"customProperty": "value"}'>
</chat-widget>
```

This filter will be applied to the user repository:

```javascript
const otherChatters = await userRepository.find({ where: this.userFilter || {} });
```

## Advanced Customization

For more advanced use cases, extend the `ChatService` class:

```javascript
import { ChatService } from 'vue-chat/src/chatService';

class CustomChatService extends ChatService {
  async getAdvisors(authUserId) {
    const advisors = await userRepository.find({ where: { isAdvisor: true } });
    return advisors;
  }
}

export default new CustomChatService();
```