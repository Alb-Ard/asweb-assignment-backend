"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.endSessionAsync = exports.getSessionUserAsync = exports.startSessionAsync = void 0;
const mongoose_1 = require("mongoose");
const uuid_1 = require("uuid");
const hoursToMills = (hours) => hours * 60 * 60 * 1000;
const tokenDurationMillis = hoursToMills(3);
const invalidToken = "";
const userTokenSchema = new mongoose_1.Schema({
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: "users" },
    token: String,
    expiry: Number,
});
const DBUserToken = (0, mongoose_1.model)("user_tokens", userTokenSchema);
const startSessionAsync = async (userId) => {
    const token = (0, uuid_1.v4)();
    const expiry = Date.now() + tokenDurationMillis;
    await new DBUserToken({
        user: mongoose_1.Types.ObjectId.createFromHexString(userId),
        token: token,
        expiry: expiry,
    }).save();
    return {
        token: token,
        expiry: expiry,
    };
};
exports.startSessionAsync = startSessionAsync;
const getSessionUserAsync = async (token) => {
    if (!!!token || token == invalidToken) {
        return null;
    }
    const userToken = await DBUserToken.findOne({ token: token }).where("expiry").gte(Date.now());
    return !!userToken ? userToken.user.toHexString() : null;
};
exports.getSessionUserAsync = getSessionUserAsync;
const endSessionAsync = async (token) => {
    if (!!!token) {
        return false;
    }
    const result = await DBUserToken.updateOne({ token: token }, { token: invalidToken, expiry: 0 });
    return result.modifiedCount > 0;
};
exports.endSessionAsync = endSessionAsync;
