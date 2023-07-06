interface User {
    readonly id: string,
    readonly username: string,
    readonly email: string,
    readonly password: string,
    readonly salt: string,
}

export default User;