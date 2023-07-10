"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUserAsync = exports.updateUserAsync = exports.readUserAsync = exports.searchUserByEmailAsync = exports.createUserAsync = void 0;
const mongoose_1 = require("mongoose");
const crypt_1 = require("../lib/crypt");
const userSchema = new mongoose_1.Schema({
    username: String,
    email: { type: String, unique: true },
    password: String,
    salt: String,
});
const DBUser = (0, mongoose_1.model)("users", userSchema);
const createUserAsync = async (username, email, password) => {
    console.log("Registering user " + email);
    const encryptedData = (0, crypt_1.encryptPassword)(password);
    await new DBUser({
        username: username,
        email: email,
        password: encryptedData.hash,
        salt: encryptedData.salt
    }).save();
};
exports.createUserAsync = createUserAsync;
const searchUserByEmailAsync = async (email) => {
    const user = await DBUser.findOne({ email: email });
    return !!user ? {
        _id: user._id.toHexString(),
        username: user.username,
        email: user.email,
        password: user.password,
        salt: user.salt,
    } : null;
};
exports.searchUserByEmailAsync = searchUserByEmailAsync;
const readUserAsync = async (id) => {
    const user = await DBUser.findOne({ _id: mongoose_1.Types.ObjectId.createFromHexString(id) });
    return !!user ? {
        _id: user._id.toHexString(),
        username: user.username,
        email: user.email,
        password: user.password,
        salt: user.salt,
    } : null;
};
exports.readUserAsync = readUserAsync;
const updateUserAsync = async (id, data) => {
    const result = await DBUser.updateOne({ _id: mongoose_1.Types.ObjectId.createFromHexString(id) }, data);
    return result.matchedCount > 0;
};
exports.updateUserAsync = updateUserAsync;
const deleteUserAsync = async (id) => {
    const result = await DBUser.deleteOne({ _id: mongoose_1.Types.ObjectId.createFromHexString(id) });
    return result.deletedCount > 0;
};
exports.deleteUserAsync = deleteUserAsync;
