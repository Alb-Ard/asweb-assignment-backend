export type UpdateFields<T> = {
    [K in keyof Partial<Omit<T, "_id">>]: any
}