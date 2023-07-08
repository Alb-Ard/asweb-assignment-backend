import crypto from "crypto";

export const encryptPassword = (word: string) => {
    const length = 16;
    const salt = crypto.randomBytes(Math.ceil(length / 2))
        .toString("hex")
        .slice(0, length);

    const hash = crypto.createHmac("sha512", salt);
    hash.update(word);
    return {
        salt: salt,
        hash: hash.digest("hex")
    };
};

export const checkPassword = async (receivedPassword: string, savedCryptedpassword: string, savedSalt: string) => {
    const validate = (userpass: string, hashedpass: string, salt: string) => {
        const hash = crypto.createHmac("sha512", salt);
        hash.update(userpass);
        userpass = hash.digest("hex");
        return userpass == hashedpass;
    };

    try {
        return validate(receivedPassword, savedCryptedpassword, savedSalt);
    } catch (err) {
        console.log(err);
        return false;
    }
}