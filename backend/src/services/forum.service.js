const Logger = require('../libs/logger')
const Models = require('../models/index')
const Op = Models.Sequelize.Op


const { spawn } = require('child_process')
const logOutput = (name) => (data) => console.log(`[${name}] ${data}`)

class ForumService {

  //Issue
  async getIssue(issueId) {
    try {
      let issue = await Models.Issue.findOne({ 
        include: [{
          model: Models.Reply,
          as: "replies" 
        }], 
        where: { id: issueId, is_delete: { [Op.ne]: 1 }} })
      return issue
    } catch (e) {
      Logger.error(e)
      return null
    }
  }

  async getIssuesByEmail(email) {
    try {
      let issue = await Models.Issue.findAll({ where: { email: email, is_delete: { [Op.ne]: 1 }} })
      return issue
    } catch (e) {
      Logger.error(e)
      return null
    }
  }

  async getAllIssues() {
    try {
      let issues = await Models.Issue.findAll({ 
        where: { is_delete: { [Op.ne]: 1 } } })
      return issues
    } catch (e) {
      Logger.error(e)
      return null
    }
  }

  async createIssue(data, email) {
    try {
      let user = await Models.User.findOne({ where: { email: email, is_delete: { [Op.ne]: 1 }} })
      let newIssue = await Models.Issue.create({
        username: user.username,
        question: data.question
      })
      return newIssue
    } catch (e) {
      Logger.error(e)
      return null
    }
  }

  async deleteIssue (issueId) {
    try {
      let deleteIssue = await Models.Issue.update(
        {
          is_delete: 1
        },
        { returning: true, where: { id: issueId } }
      )
      if (deleteIssue) { return true } else { return false }
    } catch (e) {
      Logger.error(e)
      return false
    }
  }

//End issue

//Reply
  async getReply(replyId) {
    try {
      let reply = await Models.Reply.findOne({ where: { id: replyId, is_delete: { [Op.ne]: 1 }} })
      return reply
    } catch (e) {
      Logger.error(e)
      return null
    }
  }

  async getRepliesByIssue(issueId) {
    try {

      let replies = await Models.Reply.findAll({ where: { email: email, is_delete: { [Op.ne]: 1 }} })
      return replies
    } catch (e) {
      Logger.error(e)
      return null
    }
  }

  async getAllReplies() {
    try {
      let replies = await Models.Reply.findAll({ where: { is_delete: { [Op.ne]: 1 } } })
      return replies
    } catch (e) {
      Logger.error(e)
      return null
    }
  }

  async createReply(issueId, data, email) {
    try {
      let issue  = await Models.Issue.findOne({ where: { id: issueId, is_delete: { [Op.ne]: 1 }} })
      let user = await Models.User.findOne({ where: { email: email, is_delete: { [Op.ne]: 1 }} })
      let newReply = await Models.Reply.create({
        username: user.username,
        answer: data.answer
      })
      newReply.setIssue(issue)
      return newReply
    } catch (e) {
      Logger.error(e)
      return null
    }
  }

  async deleteReply (replyId) {
    try {
      let deleteReply = await Models.Reply.update(
        {
          is_delete: 1
        },
        { returning: true, where: { id: replyId } }
      )
      if (deleteReply) { return true } else { return false }
    } catch (e) {
      Logger.error(e)
      return false
    }
  }

//End Reply

//Intent
  async getIntent(intentId) {
    try {
      let intent = await Models.Intent.findOne({ where: { id: intentId, is_delete: { [Op.ne]: 1 }} })
      return intent
    } catch (e) {
      Logger.error(e)
      return null
    }
  }

  async getIntents() {
    try {
      let intents = await Models.Intent.findAll({ where: { is_delete: { [Op.ne]: 1 } } })
      return intents
    } catch (e) {
      Logger.error(e)
      return null
    }
  }

  async getAllIntents() {
    try {
      let intents = await Models.Intent.findAll({ where: { is_delete: { [Op.ne]: 1 } } })
      return intents
    } catch (e) {
      Logger.error(e)
      return null
    }
  }

  async getRecommendedIntents(data) {
    try {
      let intents = await Models.Intent.findAll({ where: { is_delete: { [Op.ne]: 1 } } })
      return intents
    } catch (e) {
      Logger.error(e)
      return null
    }
  }

  async createIntent(data, email) {

    // (async () => {
    //   try {
    //     const output = await trainIntent(data.question, data.answer)
    //     logOutput('main')(output.message)
    //     process.exit(0)
    //   } catch (e) {
    //     console.error('Error during script execution ', e.stack);
    //     process.exit(1);
    //   }
    // })();

  
    try {
      let newIntent = await Models.Intent.create({
        email: email,
        question: data.question,
        answer: data.answer
      })
      return newIntent
    } catch (e) {
      Logger.error(e)
      return null
    }
  }

  async updateIntent(intentId, data) {
    try {
      return await Models.Intent.update(
        {
          question: data.question,
          answer: data.answer
        },
        { returning: true, where: { id: intentId, is_delete: { [Op.ne]: 1 } } }
      )
    } catch (e) {
      Logger.error(e)
      return null
    }
  }

  async deleteIntent (intentId) {
    try {
      let deleteIntent = await Models.Intent.update(
        {
          is_delete: 1
        },
        { returning: true, where: { id: intentId } }
      )
      if (deleteIntent) { return true } else { return false }
    } catch (e) {
      Logger.error(e)
      return false
    }
  }

//End Intent
  
}

// function for python script

function trainIntent(question, answer) {
  let intents = []
  try {
    intents = await Models.Intent.findAll({ where: { is_delete: { [Op.ne]: 1 } } })
  } catch (e) {
    Logger.error(e)
  }

  return new Promise((resolve, reject) => {
  
    const process = spawn('python', ['./chatbot/script.py', intents]);

    const out = []
    process.stdout.on(
      'data',
      (data) => {
        out.push(data.toString());
        logOutput('stdout')(data);
      }
    );

    const err = []
    process.stderr.on(
      'data',
      (data) => {
        err.push(data.toString());
        logOutput('stderr')(data);
      }
    );

    process.on('exit', (code, signal) => {
      // logOutput('exit')(`${code} (${signal})`)
      if (code !== 0) {
        reject(new Error(err.join('\n')))
        return
      }
      try {
        resolve(JSON.parse(out[0]));
      } catch(e) {
        reject(e);
      }
    });
  });
      
}

module.exports = ForumService