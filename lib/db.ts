import { Types } from "mongoose"
import Owner from "../models/owner";

export type UpdateFields<T> = {
    [K in keyof Partial<Omit<T, "_id">>]: any
}

export type WithObjectId<T> = Omit<T, "_id"> & { _id: Types.ObjectId };

export const mapOwner = (owner: WithObjectId<Owner>): Owner => !!owner ? ({
    _id: owner._id.toHexString(),
    username: owner.username
}) : { _id: "", username: "Unknown" };