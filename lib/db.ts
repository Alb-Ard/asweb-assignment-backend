import { Types } from "mongoose"

export type UpdateFields<T> = {
    [K in keyof Partial<Omit<T, "_id">>]: any
}

export type WithObjectId<T> = Omit<T, "_id"> & { _id: Types.ObjectId };

export const withStringId = <T>(doc: WithObjectId<T>) => {
    if (!!!doc) {
        return doc;
    }
    const { _id, ...data } = doc;
    return {
        ...data,
        _id: _id.toHexString()
    };
}

export const arrayWithStringId = <T>(docs: WithObjectId<T>[]) => docs.map(withStringId);