import db from '../db/db.js';

const createPatient = (patient , callback) => {
    const{email , name ,picture} = patient;
    const query = "INSERT INTO patient (email,name,picture) VALUES (? ,? ,?)"
    db.query(query, [email, name, picture], (err, result) => {
        if (err) return callback(err);
        callback(null, result.insertId);
    })
}
    

export default createPatient;