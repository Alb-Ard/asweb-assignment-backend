import { Schema, model } from "mongoose";
import User from "../models/User";

interface UserSchema {
    username: string,
    email: string,
    password: string,
}

const schema = new Schema<UserSchema>({
    username: String,
    email: String,
    password: String
});

const DBUser = model("Users", schema);

const createUserAsync = async (name: string, email: string, password: string) => { 
    await new DBUser({
        name: name,
        email: email,
        password: password
    }).save();
};

const searchUserByEmailAsync = async (email: string): Promise<User | null> => {
    const user = await DBUser.findOne({ email: email });
    return !!user ? { id: user._id.toHexString(), username: user.username, email: user.email, password: user.password } : null;
};

export {
    createUserAsync,
    searchUserByEmailAsync
}