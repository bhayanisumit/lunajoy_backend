import { createLog } from "../models/log.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Validator } from "node-input-validator";
import db from "../db/db.js";
import { promisify } from "util";
const query = promisify(db.query).bind(db);

 
const addLog = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  // console.log(userId);

  if (!userId) {
    return res.status(400).json({ message: "User ID is required." });
  }
  
  const v = new Validator(req.body, {
    mood_rating: 'required|string',
    anxiety: 'required|string',
    sleep_hours: 'required|numeric',
    sleep_quality: 'required|string',
    sleep_disturbance: 'required|string',
    physical_activity_type: 'required|string',
    physical_activity_duration: 'required|numeric',
    social_interaction: 'required|string',
    stress_level: 'required|string',
    symptoms: 'required|string',
  });

  const matched = await v.check();
  if (!matched) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Missing or invalid required fields", v.errors));
  } else {
    createLog({
      user_id: userId,
      mood_rating :  req.body.mood_rating,
      anxiety : req.body.anxiety,
      sleep_hours :  req.body.sleep_hours,
      sleep_quality : req.body.sleep_quality ,
      sleep_disturbance : req.body.sleep_disturbance ,
      physical_activity_type : req.body.physical_activity_type, 
      physical_activity_duration : req.body.physical_activity_duration ,
      social_interaction : req.body.social_interaction ,
      stress_level : req.body.stress_level ,
      symptoms : req.body.symptoms,
    }, (err, log) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        req.io.emit('newLog', log);
        // console.log(log)
        res
          .status(201)
          .json(new ApiResponse(201, log, "log added successfully"));
      }
    });
  }
});

 
// get log by user id

const getLogsByUserId = asyncHandler(async (req, res) => {
  const userEmail = req.user.email; // Access the email from req.user

  // console.log("User email:", userEmail);
  

  if (!userEmail) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Email not found in request."));
  }

  // Query the patient table to get the user ID
  const [userResult] = await query("SELECT id FROM patient WHERE email = ?", [
    userEmail,
  ]);

  if (!userResult || userResult.length === 0) {
    return res.status(404).json(new ApiResponse(404, null, "User not found."));
  }

  // Query the logs table using the user ID
  const logs = await query("SELECT * FROM logs WHERE user_id = ?", [userResult.id]);

  if (logs.length === 0) {
    return res
      .status(404)
      .json(new ApiResponse(404, null, "No logs found for this user."));
  }

  res
    .status(200)
    .json(new ApiResponse(200, logs, "Logs retrieved successfully."));
});



// {
//     "user_id": 6,
//     "mood_rating": "Happy",
//     "anxiety": "Mild",
//     "sleep_hours": 7,
//     "sleep_quality": "Deep Sleep",
//     "sleep_disturbance": 0,
//     "physical_activity_type": "Gym",
//     "physical_activity_duration": 30,
//     "social_interaction": "Occasionally",
//     "stress_level": "Actual",
//     "symptoms": "None",
//     "log_date": "2024-01-15"
//   }

export { addLog,  getLogsByUserId };
