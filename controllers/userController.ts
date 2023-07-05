import { Schema, model } from "mongoose";
import User from "../models/user";
import { encryptPassword } from "../lib/crypt";

interface UserSchema {
    username: string,
    email: string,
    password: string,
    salt: string,
}

const schema = new Schema<UserSchema>({
    username: String,
    email: { type: String, unique: true },
    password: String,
    salt: String,
});

const DBUser = model("users", schema);

const createUserAsync = async (name: string, email: string, password: string) => {
    console.log("Registering user " + email);
    const encryptedData = encryptPassword(password);
    await new DBUser({
        name: name,
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

export {
    createUserAsync,
    searchUserByEmailAsync
}