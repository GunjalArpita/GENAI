require('dotenv').config();
const { GoogleGenAI } = require("@google/genai")
const { z } = require("zod")
const { zodToJsonSchema } = require("zod-to-json-schema")

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY
})


const interviewReportSchema = z.object({
    matchScore: z.number().describe("A score between 0 and 100 indicating how well the candidate's profile matches the job describe"),
    technicalQuestions: z.array(z.object({
        question: z.string().describe("The technical question can be asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
    })).describe("Technical questions that can be asked in the interview along with their intention and how to answer them"),
    behavioralQuestions: z.array(z.object({
        question: z.string().describe("The technical question can be asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
    })).describe("Behavioral questions that can be asked in the interview along with their intention and how to answer them"),
    skillGaps: z.array(z.object({
        skill: z.string().describe("The skill which the candidate is lacking"),
        severity: z.enum([ "low", "medium", "high" ]).describe("The severity of this skill gap, i.e. how important is this skill for the job and how much it can impact the candidate's chances")
    })).describe("List of skill gaps in the candidate's profile along with their severity"),
    preparationPlan: z.array(z.object({
        day: z.number().describe("The day number in the preparation plan, starting from 1"),
        focus: z.string().describe("The main focus of this day in the preparation plan, e.g. data structures, system design, mock interviews etc."),
        tasks: z.array(z.string()).describe("List of tasks to be done on this day to follow the preparation plan, e.g. read a specific book or article, solve a set of problems, watch a video etc.")
    })).describe("A day-wise preparation plan for the candidate to follow in order to prepare for the interview effectively"),
    title: z.string().describe("The title of the job for which the interview report is generated"),
})

async function generateInterviewReport({ resume, selfDescription, jobDescription }) {

    const prompt = `Generate an interview report for a candidate with the following details:
                        Resume: ${resume}
                        Self Description: ${selfDescription}
                        Job Description: ${jobDescription}

    IMPORTANT: The response MUST be a single valid JSON object with EXACTLY the following structure (do not include any other fields):
    {
        "matchScore": 85,
        "title": "Software Engineer",
        "technicalQuestions": [
            {
                "question": "Sample question",
                "intention": "Sample intention",
                "answer": "Sample answer"
            }
        ],
        "behavioralQuestions": [
            {
                "question": "Sample question",
                "intention": "Sample intention",
                "answer": "Sample answer"
            }
        ],
        "skillGaps": [
            {
                "skill": "React",
                "severity": "low" // must be "low", "medium", or "high"
            }
        ],
        "preparationPlan": [
            {
                "day": 1,
                "focus": "React basics",
                "tasks": ["Read docs", "Build simple app"]
            }
        ]
    }
`

    try {
        // Max 3 retries for transient model unavailability
        const maxRetries = 3;
        let attempt = 0;
        let response;
        while (attempt < maxRetries) {
            try {
                const jsonSchema = zodToJsonSchema(interviewReportSchema);
                delete jsonSchema.$schema;
                response = await ai.models.generateContent({
                    model: "gemini-2.5-flash",
                    contents: prompt,
                    generationConfig: {
                        responseMimeType: "application/json",
                        responseSchema: jsonSchema,
                    },
                });
                break; // success
            } catch (inner) {
                // Detect model unavailability (503) or network glitches
                if (inner?.message?.includes("UNAVAILABLE") && attempt < maxRetries - 1) {
                    attempt++;
                    console.warn(`Model unavailable, retry ${attempt}/${maxRetries}...`);
                    await new Promise(res => setTimeout(res, 1000 * attempt)); // simple backoff
                    continue;
                }
                throw inner; // rethrow other errors
            }
        }
        console.log('Raw AI response:', response.text);
        // Remove possible markdown fences and trim whitespace
        const cleaned = response.text
            .replace(/```json\s*/g, "")
            .replace(/```/g, "")
            .trim();
        // Safely parse JSON – if parsing fails, treat it as an error from the model
        let parsedResponse;
        try {
            parsedResponse = JSON.parse(cleaned);
        } catch (parseErr) {
            throw new Error(`Invalid JSON from model: ${cleaned}`);
        }
        // Ensure all required fields are present
        if (!parsedResponse.matchScore || !parsedResponse.technicalQuestions || !parsedResponse.behavioralQuestions || !parsedResponse.skillGaps || !parsedResponse.preparationPlan || !parsedResponse.title) {
            throw new Error('Missing required fields in AI response');
        }
        return parsedResponse;
    } catch (error) {
        console.error("Error in generateInterviewReport:", error.message);
        return {
            matchScore: 0,
            title: "Report Generation Failed",
            technicalQuestions: [],
            behavioralQuestions: [],
            skillGaps: [],
            preparationPlan: []
        };
    }
}



async function generatePdfFromHtml(htmlContent) {
    try {
        const puppeteer = await import("puppeteer");
        const browser = await puppeteer.default.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] })
        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: "networkidle0" })

        const pdfBuffer = await page.pdf({
            format: "A4", margin: {
                top: "20mm",
                bottom: "20mm",
                left: "15mm",
                right: "15mm"
            }
        })

        await browser.close()

        return pdfBuffer
    } catch (error) {
        console.error("Error generating PDF from HTML:", error.message)
        throw new Error(`Failed to generate PDF: ${error.message}`)
    }
}

async function generateResumePdf({ resume, selfDescription, jobDescription }) {

    const resumePdfSchema = z.object({
        html: z.string().describe("The HTML content of the resume which can be converted to PDF using any library like puppeteer")
    })

    const prompt = `Generate resume for a candidate with the following details:
                        Resume: ${resume}
                        Self Description: ${selfDescription}
                        Job Description: ${jobDescription}

                        the response should be a JSON object with a single field "html" which contains the HTML content of the resume which can be converted to PDF using any library like puppeteer.
                        The resume should be tailored for the given job description and should highlight the candidate's strengths and relevant experience. The HTML content should be well-formatted and structured, making it easy to read and visually appealing.
                        The content of resume should be not sound like it's generated by AI and should be as close as possible to a real human-written resume.
                        you can highlight the content using some colors or different font styles but the overall design should be simple and professional.
                        The content should be ATS friendly, i.e. it should be easily parsable by ATS systems without losing important information.
                        The resume should not be so lengthy, it should ideally be 1-2 pages long when converted to PDF. Focus on quality rather than quantity and make sure to include all the relevant information that can increase the candidate's chances of getting an interview call for the given job description.

    IMPORTANT: The response MUST be a single valid JSON object with EXACTLY the following structure (do not include any other fields):
    {
        "html": "<html><body>Your generated HTML content here...</body></html>"
    }
                    `

    try {
        const maxRetries = 3;
        let attempt = 0;
        let response;

        while (attempt < maxRetries) {
            try {
                const jsonSchema = zodToJsonSchema(resumePdfSchema)
                delete jsonSchema.$schema

                response = await ai.models.generateContent({
                    model: "gemini-2.5-flash",
                    contents: prompt,
                    generationConfig: {
                        responseMimeType: "application/json",
                        responseSchema: jsonSchema,
                    }
                })
                break;
            } catch (inner) {
                if (inner?.message?.includes("UNAVAILABLE") && attempt < maxRetries - 1) {
                    attempt++;
                    console.warn(`Model unavailable, retry ${attempt}/${maxRetries}...`);
                    await new Promise(res => setTimeout(res, 1000 * attempt));
                    continue;
                }
                throw inner;
            }
        }

        const cleaned = response.text
            .replace(/```json\s*/g, "")
            .replace(/```/g, "")
            .trim()
        let jsonContent
        try {
            jsonContent = JSON.parse(cleaned)
        } catch (parseErr) {
            console.warn('AI generation failed, using fallback HTML', parseErr.message)
            jsonContent = { html: '<html><body><h1>Resume</h1><p>Unable to generate resume content via AI.</p></body></html>' }
        }        if (!jsonContent.html) {
            throw new Error('No HTML content generated in resume')
        }

        const pdfBuffer = await generatePdfFromHtml(jsonContent.html)

        return pdfBuffer
    } catch (error) {
        console.error("Error in generateResumePdf:", error.message)
        throw new Error(`Failed to generate resume PDF: ${error.message}`)
    }

}

module.exports = { generateInterviewReport, generateResumePdf, generatePdfFromHtml }