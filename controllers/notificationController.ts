import { model, Schema, Types } from "mongoose";
import { UpdateFields } from "../lib/db";
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
    const notification = await new DBNotification({
        user: Types.ObjectId.createFromHexString(targetUserId),
        dateTimestamp: timestamp,
        read: false,
        text: text,
        href: href
    }).save();
    return !!notification ? mapNotification(notification) : null;
};

const readNotificationAsync = async (id: string): Promise<UserNotification | null> => {
    const notification = await DBNotification.findOne({ _id: Types.ObjectId.createFromHexString(id) });
    return !!notification ? mapNotification(notification) : null;
}

const readUserNotificationsAsync = async (userId: string): Promise<UserNotification[]> => {
    const notifications = await DBNotification.find({ user: Types.ObjectId.createFromHexString(userId) });
    return notifications.map(mapNotification);
}

const updateNotificationAsync = async (id: string, newData: UpdateFields<UserNotification>): Promise<boolean> => {
    const result = await DBNotification.updateOne({ _id: Types.ObjectId.createFromHexString(id) }, newData);
    return result.modifiedCount > 0;
};

const deleteNotificationAsync = async (id: string): Promise<boolean> => {
    const result = await DBNotification.deleteOne({_id: Types.ObjectId.createFromHexString(id)});
    return result.deletedCount > 0;
};

const mapNotification = (dbDoc: NotificationSchema & { _id: Types.ObjectId }): UserNotification => {
    return {
        _id: dbDoc._id.toHexString(),
        user: dbDoc.user.toHexString(),
        dateTimestamp: dbDoc.dateTimestamp,
        read: dbDoc.read,
        text: dbDoc.text,
        href: dbDoc.href
    };
}

export {
    createNotificationAsync,
    readNotificationAsync,
    readUserNotificationsAsync,
    updateNotificationAsync,
    deleteNotificationAsync,
}