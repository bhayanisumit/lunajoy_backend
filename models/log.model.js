import db from "../db/db.js";
import { promisify } from "util";
const query = promisify(db.query).bind(db);

const createLog = (newLog, result) => {
  db.query("INSERT INTO logs SET ?", newLog, (err, res) => {
    // console.log(res)
    if (err) {
      console.log("Error: ", err);
      result(err, null);
      return;
    }
    result(null, { ...newLog });
  });
};

const getLogById = (userId, result) => {
  const query = "SELECT * FROM logs WHERE user_id =?";
  db.query(query, [userId], (err, res) => {
    if (err) {
      console.log("Error: ", err);
      result(err, null);
      return;
    }
  });
};

export { createLog,getLogById };
