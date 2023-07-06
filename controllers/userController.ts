import { Schema, Types, model } from "mongoose";
import User from "../models/user";
import { encryptPassword } from "../lib/crypt";

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
        id: user._id.toHexString(),
        username: user.username,
        email: user.email,
        password: user.password,
        salt: user.salt,
    } : null;
};

const readUserAsync = async (id: string): Promise<User | null> => {
    const user = await DBUser.findOne({ _id: Types.ObjectId.createFromHexString(id) });
    return !!user ? {
        id: user._id.toHexString(),
        username: user.username,
        email: user.email,
        password: user.password,
        salt: user.salt,
    } : null;
};

export {
    createUserAsync,
    searchUserByEmailAsync,
    readUserAsync
}