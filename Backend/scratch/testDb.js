require('dotenv').config();
const mongoose = require('mongoose');
const connect = require('../src/config/database');
const InterviewReport = require('../src/models/interviewReport.model');

(async () => {
  try {
    await connect();
    const report = await InterviewReport.findOne();
    console.log('Found report ID:', report ? report._id : 'none');
    process.exit();
  } catch (e) {
    console.error('Error:', e);
    process.exit(1);
  }
})();
