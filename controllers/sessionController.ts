import { Schema, Types, model } from "mongoose";
import { v4 as uuid } from "uuid";

const hoursToMills = (hours: number) => hours * 60 * 60 * 1000;

const tokenDurationMillis = hoursToMills(3);
const invalidToken = "";

interface UserTokenSchema {
    user: Types.ObjectId,
    token: string,
    expiry: number,
}

const userTokenSchema = new Schema<UserTokenSchema>({
    user: { type: Schema.Types.ObjectId, ref: "users" },
    token: String,
    expiry: Number,
});

const DBUserToken = model("user_tokens", userTokenSchema);

const startSessionAsync = async (userId: string): Promise<{ token: string, expiry: number }> => {
    const token = uuid();
    const expiry = Date.now() + tokenDurationMillis;
    await new DBUserToken({
        user: Types.ObjectId.createFromHexString(userId),
        token: token,
        expiry: expiry,
    }).save();
    return {
        token: token,
        expiry: expiry,
    };
}

const getSessionUserAsync = async (token?: string): Promise<string | null> => {
    if (!!!token || token === invalidToken) {
        return null;
    }
    const userToken = await DBUserToken.findOne({ token: token }).where("expiry").gte(Date.now());
    return !!userToken ? userToken.user.toHexString() : null;
}

const endSessionAsync = async (token?: string): Promise<boolean> => {
    if (!!!token) {
        return true;
    }
    const result = await DBUserToken.updateOne({ token: token }, { token: invalidToken });
    return result.modifiedCount > 0;
}

export {
    startSessionAsync,
    getSessionUserAsync,
    endSessionAsync
};