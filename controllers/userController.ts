import { Schema, Types, model } from "mongoose";
import User from "../models/user";
import { encryptPassword } from "../lib/crypt";
import { UpdateFields } from "../lib/db";

interface UserSchema {
    username: string,
    email: string,
    password: string,
    salt: string,
}

const userSchema = new Schema<UserSchema>({
    username: String,
    email: { type: String, unique: true },
    password: String,
    salt: String,
});

const DBUser = model("users", userSchema);

const createUserAsync = async (username: string, email: string, password: string) => {
    console.log("Registering user " + email);
    const encryptedData = encryptPassword(password);
    await new DBUser({
        username: username,
        email: email,
        password: encryptedData.hash,
        salt: encryptedData.salt
    }).save();
};

const searchUserByEmailAsync = async (email: string): Promise<User | null> => {
    const user = await DBUser.findOne({ email: email });
    return !!user ? {
        _id: user._id.toHexString(),
        username: user.username,
        email: user.email,
        password: user.password,
        salt: user.salt,
    } : null;
};

const readUserAsync = async (id: string): Promise<User | null> => {
    const user = await DBUser.findOne({ _id: Types.ObjectId.createFromHexString(id) });
    return !!user ? {
        _id: user._id.toHexString(),
        username: user.username,
        email: user.email,
        password: user.password,
        salt: user.salt,
    } : null;
};

const updateUserAsync = async (id: string, data: UpdateFields<User>) => {
    const result = await DBUser.updateOne({ _id: Types.ObjectId.createFromHexString(id) }, data);
    return result.matchedCount > 0;
}

const deleteUserAsync = async (id: string) => {
    const result = await DBUser.deleteOne({ _id: Types.ObjectId.createFromHexString(id) });
    return result.deletedCount > 0;
}


export {
    createUserAsync,
    searchUserByEmailAsync,
    readUserAsync,
    updateUserAsync,
    deleteUserAsync
}