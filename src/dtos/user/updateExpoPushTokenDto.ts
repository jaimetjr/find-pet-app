export class UpdateExpoPushTokenDTO {
    clerkId: string;
    expoPushToken: string;

    constructor(clerkId: string, expoPushToken: string) {
        this.clerkId = clerkId;
        this.expoPushToken = expoPushToken;
    }
} 