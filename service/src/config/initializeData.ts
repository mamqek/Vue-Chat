// service/src/initializeData.ts
import { AppDataSource } from './dataSource';
import { User } from '../entities/User';
import { Chat } from '../entities/Chat';

export async function initializeData() {
    const userRepository = AppDataSource.getRepository(User);
    const userCount = await userRepository.count();

    if (userCount === 0) {
        // Create two users if none exist.
        const user1 = userRepository.create({
            full_name: 'Alice',
            avatar: 'alice.png',
            bio: 'Hi, I am Alice',
        });
        const user2 = userRepository.create({
            full_name: 'Bob',
            avatar: 'bob.png',
            bio: 'Hello, I am Bob',
        });
        
        await userRepository.save([user1, user2]);

        const chatRepository = AppDataSource.getRepository(Chat);

        const chat = chatRepository.create({
            user1,
            user2,
            created_at: new Date(),
            updated_at: new Date(),
            user1_unread_count: 0,
            user2_unread_count: 0
        });
        await chatRepository.save(chat);

        console.log('Users created:', user1, user2);
    } else {
        console.log('Users already exist, skipping user creation.');
    }
}
