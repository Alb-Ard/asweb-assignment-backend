import {model, Schema, Types} from "mongoose";
import Review  from "../models/review";
import {UpdateFields} from "../lib/db";
import Owner from "../models/owner";
import UserNotification from "../models/userNotification";

interface NotificationSchema {
    user: Types.ObjectId,
    dateTimestamp: number,
    read: boolean,
    text: string,
    href?: string
};

const notificationSchema = new Schema<NotificationSchema>({
    user: { type: Schema.Types.ObjectId, ref: "users" },
    dateTimestamp: Number,
    read: Boolean,
    text: String,
    href: { type: String, required: false }
});

const DBNotification = model("notifications", notificationSchema);

const createNotificationAsync = async (targetUserId: string, text: string, timestamp: number, href?: string) => {
    return (await new DBNotification({
        user: Types.ObjectId.createFromHexString(targetUserId),
        dateTimestamp: timestamp,
        read: false,
        text: text,
        href: href
    }).save())?._id?.toHexString();
};

const readNotificationAsync = async (id: string): Promise<UserNotification | null> => {
    const notification = await DBNotification.findOne({ _id: Types.ObjectId.createFromHexString(id) })
        .populate<{ user: Owner }>("user", ["username"]);
    return !!notification ? ({
        _id: notification._id.toHexString(),
        user: notification.user,
        dateTimestamp: notification.dateTimestamp,
        read: notification.read,
        text: notification.text,
        href: notification.href
    }) : null;
}

const readUserNotificationsAsync = async (userId: string): Promise<UserNotification[]> => {
    const notifications = await DBNotification.find({ user: Types.ObjectId.createFromHexString(userId) })
        .populate<{ user: Owner }>("user", ["username"]);
    return notifications.map(notification => ({
        _id: notification._id.toHexString(),
        user: notification.user,
        dateTimestamp: notification.dateTimestamp,
        read: notification.read,
        text: notification.text,
        href: notification.href
    }));
}

const updateNotificationAsync = async (id: string, newData: UpdateFields<UserNotification>): Promise<boolean> => {
    const result = await DBNotification.updateOne({ _id: Types.ObjectId.createFromHexString(id) }, newData);
    return result.modifiedCount > 0;
};

const deleteNotificationAsync = async (id: string): Promise<boolean> => {
    const result = await DBNotification.deleteOne({_id: Types.ObjectId.createFromHexString(id)});
    return result.deletedCount > 0;
};

export {
    createNotificationAsync,
    readNotificationAsync,
    readUserNotificationsAsync,
    updateNotificationAsync,
    deleteNotificationAsync,
}