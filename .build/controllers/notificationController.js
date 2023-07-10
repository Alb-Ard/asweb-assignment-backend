"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteNotificationAsync = exports.updateNotificationAsync = exports.readUserNotificationsAsync = exports.readNotificationAsync = exports.createNotificationAsync = void 0;
const mongoose_1 = require("mongoose");
;
const notificationSchema = new mongoose_1.Schema({
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: "users" },
    dateTimestamp: Number,
    read: Boolean,
    text: String,
    href: { type: String, required: false }
});
const DBNotification = (0, mongoose_1.model)("notifications", notificationSchema);
const createNotificationAsync = async (targetUserId, text, timestamp, href) => {
    const notification = await new DBNotification({
        user: mongoose_1.Types.ObjectId.createFromHexString(targetUserId),
        dateTimestamp: timestamp,
        read: false,
        text: text,
        href: href
    }).save();
    return !!notification ? mapNotification(notification) : null;
};
exports.createNotificationAsync = createNotificationAsync;
const readNotificationAsync = async (id) => {
    const notification = await DBNotification.findOne({ _id: mongoose_1.Types.ObjectId.createFromHexString(id) });
    return !!notification ? mapNotification(notification) : null;
};
exports.readNotificationAsync = readNotificationAsync;
const readUserNotificationsAsync = async (userId) => {
    const notifications = await DBNotification.find({ user: mongoose_1.Types.ObjectId.createFromHexString(userId) });
    return notifications.map(mapNotification);
};
exports.readUserNotificationsAsync = readUserNotificationsAsync;
const updateNotificationAsync = async (id, newData) => {
    const result = await DBNotification.updateOne({ _id: mongoose_1.Types.ObjectId.createFromHexString(id) }, newData);
    return result.modifiedCount > 0;
};
exports.updateNotificationAsync = updateNotificationAsync;
const deleteNotificationAsync = async (id) => {
    const result = await DBNotification.deleteOne({ _id: mongoose_1.Types.ObjectId.createFromHexString(id) });
    return result.deletedCount > 0;
};
exports.deleteNotificationAsync = deleteNotificationAsync;
const mapNotification = (dbDoc) => {
    return {
        _id: dbDoc._id.toHexString(),
        user: dbDoc.user.toHexString(),
        dateTimestamp: dbDoc.dateTimestamp,
        read: dbDoc.read,
        text: dbDoc.text,
        href: dbDoc.href
    };
};
