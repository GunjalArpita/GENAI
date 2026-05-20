const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware")
const interviewController = require("../controllers/interview.controller")
const upload = require("../middlewares/file.middleware")
const interviewRouter = express.Router()

/**
 * @route POST /api/interview/
 * @description geneate new interview report on basis of user self description
 * ,resume pdf and job description
 * @access private
 */

interviewRouter.post("/",authMiddleware.authUser,upload.single("resume"),interviewController.generateInterviewReportController)

/**
 * Route: GET /api/interview/report:interviewId
 * Description: Get interview report by ID
 * Access: Private
 */
interviewRouter.get("/report/:interviewId",authMiddleware.authUser,interviewController.getInterviewReportByIdController)


/**
 * Route: GET /api/interview/
 * Description: Get all interview reports of the authenticated user
 * Access: Private
 */
interviewRouter.get("/",authMiddleware.authUser,interviewController.getAllInterviewReportsController)
 

/**
 * @route POST /api/interview/resume/pdf/:interviewReportId
 * @description Generate resume PDF based on interview report
 * @access private
 */
 
interviewRouter.post("/resume/pdf/:interviewReportId",authMiddleware.authUser,interviewController.generateResumePdfController)
module.exports = interviewRouter