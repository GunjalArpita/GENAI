import { getAllInterviewReports, generateInterviewReport, getInterviewReportById, generateResumePdf } from "../services/interview.api"
import { useContext, useEffect, useCallback } from "react"
import { InterviewContext } from "../interview.context"
import { useParams } from "react-router"


export const useInterview = () => {

    const context = useContext(InterviewContext)
    const { interviewId } = useParams()

    if (!context) {
        throw new Error("useInterview must be used within an InterviewProvider")
    }

    const { loading, setloading, report, setReport, reports, setReports } = context

    const generateReport = useCallback(async ({ jobDescription, selfDescription, resumeFile }) => {
        setloading(true)
        let response = null
        try {
            response = await generateInterviewReport({ jobDescription, selfDescription, resumeFile })
            setReport(response.interviewReport)
        } catch (error) {
            console.log(error)
        } finally {
            setloading(false)
        }

        return response?.interviewReport
    }, [setloading, setReport])

    const getReportById = useCallback(async (interviewId) => {
        setloading(true)
        let response = null
        try {
            response = await getInterviewReportById(interviewId)
            setReport(response.interviewReport)
        } catch (error) {
            console.log(error)
        } finally {
            setloading(false)
        }
        return response?.interviewReport
    }, [setloading, setReport])

    const getReports = useCallback(async () => {
        setloading(true)
        let response = null
        try {
            response = await getAllInterviewReports()
            setReports(response.interviewReports)
        } catch (error) {
            console.log(error)
        } finally {
            setloading(false)
        }

        return response?.interviewReports
    }, [setloading, setReports])

    const getResumePdf = useCallback(async (interviewReportId) => {
        setloading(true)
        let response = null
        try {
            response = await generateResumePdf({ interviewReportId })
            const url = window.URL.createObjectURL(new Blob([ response ], { type: "application/pdf" }))
            const link = document.createElement("a")
            link.href = url
            link.setAttribute("download", `resume_${interviewReportId}.pdf`)
            document.body.appendChild(link)
            link.click()
        }
        catch (error) {
            console.log(error)
        } finally {
            setloading(false)
        }
    }, [setloading])

    useEffect(() => {
        if (interviewId) {
            getReportById(interviewId)
        } else {
            getReports()
        }
    }, [ interviewId, getReportById, getReports ])

    return { loading, report, reports, generateReport, getReportById, getReports, getResumePdf }

}