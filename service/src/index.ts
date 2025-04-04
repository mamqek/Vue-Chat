import { startService } from './server';
import { initializeData } from './database/initializeData';

let config = {
        // setConfigVariable('User', 
        //     { 
        //         field_mapping: {
        //             full_name: {
        //                 name: "username",
        //                 default: "'User'",
        //             },
        //             bio: {
        //                 name: "description",
        //                 isNullable: true,
        //             },
        //         },
        //     }
        // );
};

// 2. Initialize Data
startService()
.then(() => {
    initializeData();
    console.log("Chat service started successfully.")
})
.catch((err) => console.error("Failed to start chat service:", err));

