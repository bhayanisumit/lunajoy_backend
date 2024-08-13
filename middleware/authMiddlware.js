import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import express from "express";
import dotenv from "dotenv";
import { jwtDecode } from "jwt-decode";
import db from "../db/db.js";
import { promisify } from "util";
const query = promisify(db.query).bind(db);

function getAuthCookieValue(cookieHeader) {
  if (!cookieHeader) {
    return undefined;
  }

  const authCookie = cookieHeader
    .split('; ')
    .find(row => row.startsWith('auth='))
    ?.split('=')[1];

  return authCookie;
}

const authenticateToken = async (req, res, next) => {

  // const temp = req.headers.cookie;
  const reqHeaders = getAuthCookieValue(req.headers.cookie);
  
  const token = req.cookies.auth || reqHeaders; //when i request from frontend i got undefined
  // console.log("Request Headers:", reqHeaders)
  // console.log("token from mid : " , token)

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  try {
    // Ensure that JWT_SECRET is correctly loaded
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not defined in the environment variables.");
      return res.status(500).json({ message: "Internal server error." });
    }

    // decoded token
    const decoded = jwt.decode(token);

    const email = decoded.email;
    // console.log("Extracted email:", email);

    const [userResult] = await query("SELECT id FROM patient WHERE email = ?", [
      email,
    ]);

    if (!userResult || userResult.length === 0) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "User not found."));
    }

    const id = userResult.id;

    req.user = { email, id };
    next(); // Uncomment this to proceed to the next middleware/controller
  } catch (ex) {
    console.error("Token verification failed:", ex);
    res.status(400).json({ message: "Invalid token." });
  }
};

export { authenticateToken };
