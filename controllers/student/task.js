const Task = require('../../models/student/task');

module.exports.newTaskForm = (req, res)=>{
    res.render('student/task/newTask')
};

module.exports.allTasks = async(req, res)=>{
    const tasks  = await Task.find();
    res.render('student/task/allTasks', {tasks})
}

module.exports.newTask = async(req, res)=>{
    const {title, subject, type, duedate, description, priority, difficulty, milestones, status} = req.body;
}