import mongoose from "mongoose"

const courseSchema= new  mongoose.Schema({

coursename:{
    type:String,
    require:true
},

description: {
    type: String,
    required: true
},

isapproved: {
    type: Boolean,
    default: false
},

liveClasses: [{
    title: String,
    timing: Number,
    endTiming: Number,
    date:Date,
    link: String,
    status: {
        type: String,
        enum: ['upcoming', 'in-progress', 'completed'],
        default: 'upcoming'
      }
  }],

recordedClasses: [{
    title: {
      type: String,
      required: true,
    },
    description: String,
    link: {
      type: String,
      required: true,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
    approvedByAdmin: {
      type: Boolean,
      default: false,
    },
  }],

enrolledteacher:{
    type:mongoose.Schema.Types.ObjectId,
    ref: "teacher",
    require:true
},

enrolledStudent: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'student' 
  }],

schedule: [{
    day: {
        type: Number,
        enum: [0, 1, 2, 3, 4, 5, 6]
    },
    starttime: {
        type: Number,
        min: 0,
        max: 24 * 60 
    },
    endtime: {
        type: Number,
        min: 0,
        max: 24 * 60 
    }
}],



},{timestamps:true})

const course= mongoose.model('course',courseSchema)

export {course}
