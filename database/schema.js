var mongoose = require('mongoose')
var Schema = mongoose.Schema;
var bcrypt = require("bcrypt");

function setPassword(value) {
  return bcrypt.hashSync(value, 10);
}

const SchoolSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true
  },
  link: {
    type: String,
    required: false
  }
})

// SchoolSchema.index({name: 'text', address: 'text'});

const UserSchema = new Schema({
  password: {
    type: String,
    required: false,
    set: setPassword
  },
  email: {
    type: String,
    required: true
    //need pre save to validate number
  },
  phoneNumber: {
    type: String,
    required: false
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  country: {
    type: String,
    required: true,
    default: "Kyrgyzstan"
  },
  locality: { //city or village
    type: String,
    required: true,
    default: "Bishkek"
  },
  school: {
    type: String,
    required: false
  },
  grade: {
    type: String,
    required: false
  },
  personalInfo: {
    career:{
      type: String,
      required: false
    },
    purpose: {
      type: String,
      required: false
    }
  },
  avatar: {
    type: String,
    required: true,
    default: "path/to/default/avatar.png"
  },
  isAdmin: {
    type: Boolean,
    required: true,
    default: false
  },
  isActive: {
    type: Boolean,
    required: true,
    default: false
  },
  language: {
    type: String,
    required: true,
    default: "Russian"
  },
  lastLogin:
  {
    type: Date,
    required: false
  },
  xp:
  {
    type: Number,
    required: true,
    default: 0
  },
  efficiency:{
    type: Number,
    required: true,
    default:0
  },
  solvingTime:{
    type: Number,
    required:false,
    default: 0
  },
  acceptedEachStage: [{
    stageId:{
      type: String,
      required: true,
    },
    counter: {
      type: Number,
      required: true,
      default: 0
    },
    xpOnStage: {
      type: Number,
      required: true,
      default: 0
    }
  }],
  acceptedCounter: {
    type: Number,
    required:true,
    default:0
  }
});

const stageSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  counterOfLevels: {
    type: Number,
    required: true,
    default:10
  },
  maxXp: {
    type: Number,
    required:true,
    default:1000
  },
  complexity: {
    type: Number,
    required: true,
    default:1
  }
});

const levelSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  stageId:{
    type: String,
    required: true
  },
  blocks: [{

    color: {
      type: String,
      required: true
    },
    position: {
      type: [Number],
      required: true
    }
  }],
  stars: {
    type: [{
      position: {
        type: [Number],
        required: false
      }
    }],
    default: undefined,
  },
  hero: {
    position: {
      type: [Number],
      required: true
    },
    direction: {
      type: Number,
      required: true
    }
  },
  restrictions: {
    allowedCommands: {
      type: [String],
      required: true,
      default: ['step']
    },
    numberOfFunctions: {
      type: Number,
      required: true,
      default: 1
    },
    numberOfCommands: {
      type: Number,
      required: true,
      default: 100
    },
    numberOfCommandsInFunction: {
      type: [Number],
      required: true
    }
  },
  pointsForLevel: {
    xp: {
      type: Number,
      required: true,
      default: 100
    },
    minNumberOfCommands: {
      type: Number,
      required: true,
      default:5
    }
  },
  position :{
    type: Number,
    required: true,
  }
})


const tutorialSchema = new Schema({
  levelId: {
    type: String,
    required: true
  },
  src: {
    type: String,
    required: true
  },
  position: {
    type: Number,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  lang: {
    type: String,
    required: true,
    default: 'ru'
  }
})

levelSchema.pre("save", function (next) {
  var self = this;
  this.blocks.sort(function (a, b) {
    if (a.position[0] != b.position[0])
      return a.position[0] - b.position[0];
    else if (a.position[1] != b.position[1])
      return a.position[1] - b.position[1]
  });

  next();
})

const SubmissionSchema = new Schema({
  userId: {
    type: String,
    required: true
  },
  solution: {
    type: Object,
    required: true
  },
  levelId: {
    type: String,
    required: true
  },
  stageId:{
    type: String,
    required:false
  },
  date: {
    type: Date,
    required: true,
    default: Date.now()
  },
  executionTime: {
    type: Number,
    required: true
  },
  xp : {
    type: Number,
    required: true
  },
  efficiency:{
    type: Number,
    required: true,
    default:50
  },
  solvingTime: {
    type: Number,
    required: true,
    default: 100
  }
});

const LikeSchema = new Schema({
  sourceUserId: {
    type: String,
    required: true
  },
  destinationUserId: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now()
  }
});

const RankSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  xpFrom: {
    type:Number,
    required: false
  },
  xpTo: {
    type:Number,
    required: false
  },
  percentageFrom: {
    type:Number,
    required: true
  },
  percentageTo: {
    type:Number,
    required: true
  },
  img: {
    type: String,
    required: false
  }
});


module.exports = {
  Level: levelSchema,
  User: UserSchema,
  Submission: SubmissionSchema,
  LikeHistory: LikeSchema,
  Rank: RankSchema,
  Stage: stageSchema,
  Tutorial: tutorialSchema,
  School: SchoolSchema
}