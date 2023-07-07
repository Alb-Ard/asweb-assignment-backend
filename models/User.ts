import Owner from "./owner";

interface User extends Owner {
    readonly email: string,
    readonly password: string,
    readonly salt: string,
}

export default User;