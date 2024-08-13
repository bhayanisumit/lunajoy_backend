import createPatient from "../models/patient.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {jwtDecode} from "jwt-decode"
import db from "../db/db.js";
import { promisify } from "util";
const query = promisify(db.query).bind(db);

const addPatient = asyncHandler(async (req, res) => {
  const patientData = req.body;

  if (!patientData.name || !patientData.email || !patientData.picture) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Missing required fields"));
  }

  // Check existing patient
  const result = await query("SELECT * FROM patient WHERE email = ?", [
    patientData.email,
  ]);

  if (result.length > 0) {
    return res
      .status(200)
      .json({ status: 200, data: null, message: "Email already exists" });
  } else {
    createPatient(patientData, (err, patient) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res
          .status(201)
          .json(
            new ApiResponse(201, patientData, "patient added successfully")
          );
      }
    });
  }
});

// getPatientFromEmail
const getPatient = asyncHandler(async (req, res) => {
  try {
    // Access the token from cookies
    const token = req.cookies.auth ;

    if (!token) {
      return res
        .status(401)
        .json(new ApiResponse(401, null, "No token found in cookies"));
    }

    // Decode the token to get the payload
    const decodedToken = jwtDecode(token);

    // Extract the email from the token payload
    const email = decodedToken.email;

    if (!email) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Email not found in token"));
    }

    // Use the extracted email in your query
    const result = await query("SELECT * FROM patient WHERE email = ?", [
      email,
    ]);

    res
      .status(200)
      .json(new ApiResponse(200, result, "Patient fetched by email"));
  } catch (error) {
    console.error("Error fetching patient:", error);
    res.status(500).json(new ApiResponse(500, null, "Internal Server Error"));
  }
});

export { addPatient, getPatient };
