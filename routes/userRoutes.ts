import express from "express";
import { createUserAsync, searchUserByEmailAsync } from "../controllers/userController";

const userRoutes = express.Router();

userRoutes.put("/api/user/register", (request, response) => {
    const newUserData = JSON.parse(request.body);
    createUserAsync(newUserData.name, newUserData.email, newUserData.password)
        .then(() => response.sendStatus(200).send())
        .catch(err => response.status(500).send(err));
});

userRoutes.post("/api/user/login", (request, response) => {
    const loginData = JSON.parse(request.body);
    searchUserByEmailAsync(loginData.email).then(user => {
        if (!!user && loginData.password === user.password) {
            response.sendStatus(200).send();
        } else {
            response.sendStatus(403).send();
        }
    }).catch(err => response.status(500).send(err));
});

export default userRoutes;
