import Owner from "./owner";

interface UserNotification {
    readonly _id: string,
    readonly user: string,
    readonly text: string,
    readonly read: boolean,
    readonly href?: string,
    readonly dateTimestamp: number,
}

export default UserNotification;