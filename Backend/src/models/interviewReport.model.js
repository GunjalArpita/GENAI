const mongoose = require('mongoose');

/**
 * user input-
 * 
 * job description schema :String
 * resume text : String
 * self description :String
 * matchscore :Number
 * 
 * 
 *ai will generate-

 * technical questions:
              [{
             question : "", 
             answer : "" , 
             intension :""
             }]
 * behavioural questions :
             [{
           question : "", 
           answer : "" , 
           intension :""
           }]
 * skill gaps : 
           [{
 *      skill:"" ,
         severity :"" ,
         type : String},
          enum :["low","medium","high"]
          }]
 * prepration plans : [{
           day : Number ,
           focus : String
           tasks : [String]}]
 */


    const technicalQuestionSchema = new mongoose.Schema({
    question: {
       type: String, 
       required: [true, 'Question is required']
       },
    answer: { 
      type: String,
        required: [true, 'Answer is required']
      },
    intention: { 
      type: String, 
      required: [true, 'Intention is required'] 
    }
},{
    _id: false
});

const behaviouralQuestionSchema = new mongoose.Schema({
    question: { 
      type: String,
        required: [true, 'Question is required']
        },
    answer: {

        type: String, 
        required: [true, 'Answer is required']
        },
    intention: {

        type: String,
        required: [true, 'Intention is required']
        }
},{
    _id: false
});

const skillGapSchema = new mongoose.Schema({
    skill: {
        type: String,
        required: [true, 'Skill is required']
    },
    severity: {
        type: String,
        enum: ['low', 'medium', 'high'],
        required: [true, 'Severity is required']
        
    },
},{
    _id: false
});



const preparationPlanSchema = new mongoose.Schema({
    day: {
        type: Number,
        required: [true, 'Day is required']
    },
    focus: {
        type: String,
        required: [true, 'Focus is required']
    },
    tasks: [{
        type: String,
        required: [true, 'At least one task is required']
    }]
},{
    _id: false
});


    const interviewReportSchema = new mongoose.Schema({
    jobDescription: { 
      type: String,
       required: [ true, 'Job description is required'] 
      },

    resume: {
       type: String, 
      
       
      },
    selfDescription: { 
      type: String,
      
      }
,
    matchScore: {
       type: Number,
       min:0,
       max:100,
       
       },
    technicalQuestions: [technicalQuestionSchema],
    behaviouralQuestions: [behaviouralQuestionSchema],
    skillGaps: [skillGapSchema],  
    preparationPlans: [preparationPlanSchema],
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"users"
    },
    title: {    
        type: String,
        required: [true, 'Title is required']
    }
},{
  timestamps: true
});
       

const InterviewReportModel = mongoose.model('InterviewReport', interviewReportSchema);
module.exports = InterviewReportModel;