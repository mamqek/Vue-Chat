// service/src/initializeData.ts
import { AppDataSource } from './dataSource';
import { Chat } from '../entities/Chat';
import { getConfigVariable } from '../config/config.server';
import { BaseUser } from '../entities/BaseUser';

export async function initializeData() {
    let User = getConfigVariable("user_entity");
    const userRepository = AppDataSource.getRepository(User);
    const userCount = await userRepository.count();

    if (userCount === 0) {
        const user1 = createCustomUser({
            full_name: 'Alice',
            avatar: 'alice.png',
            bio: 'Hi, I am Alice',
        });
        const user2 = createCustomUser({
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

function createCustomUser(data: Partial<BaseUser>): BaseUser {
    const UserConstructor = getConfigVariable("user_entity"); // no parentheses
    const user = new UserConstructor();
    if (data.full_name) user.full_name = data.full_name; // Invokes the setter
    if (data.bio) user.bio = data.bio; // Invokes the setter
    if (data.avatar) user.avatar = data.avatar;
    return user;
}