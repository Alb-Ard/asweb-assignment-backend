import express from "express";
import { createUserAsync, searchUserByEmailAsync } from "../controllers/userController";
import { checkPassword } from "../lib/crypt";

const userRoutes = express.Router();

userRoutes.put("/api/user/register", (request, response) => {
    const newUserData = JSON.parse(request.body);
    createUserAsync(newUserData.name, newUserData.email, newUserData.password)
        .then(() => response.sendStatus(200).send())
        .catch(err => response.status(500).send(err));
});

userRoutes.post("/api/user/login", (request, response) => {
    const loginData = JSON.parse(request.body);
    searchUserByEmailAsync(loginData.email).then(async user => {
        if (!!user && await checkPassword(loginData.password, user.password, user.salt)) {
            response.sendStatus(200).send();
        } else {
            response.sendStatus(403).send();
        }
    }).catch(err => response.status(500).send(err));
});

export default userRoutes;
