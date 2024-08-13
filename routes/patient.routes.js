import {Router} from 'express';
import { addPatient, getPatient } from '../controller/patient.controller.js'; 
const router= Router();

router.route('/new-patient').post(addPatient);
router.route('/').get(getPatient)


export default router;