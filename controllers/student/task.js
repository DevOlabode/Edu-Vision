const Task = require('../../models/student/task');
const taskPlanner = require('../../AI/task');

module.exports.newTaskForm = (req, res)=>{
    res.render('student/task/newTask')
};

module.exports.allTasks = async(req, res)=>{
    const tasks  = await Task.find();
    res.render('student/task/allTasks', {tasks})
}

module.exports.newTask = async(req, res)=>{
    const {title, subject, type, dueDate, description, priority, difficulty, milestones} = req.body;
    const task = new Task({
        title,
        subject,
        type,
        dueDate,
        description,
        priority,
        difficulty,
        milestones: Array.isArray(milestones) ? milestones : [],
        createdBy: req.user._id
    });
    await task.save();
    req.flash('success', 'Task created successfully!');
    res.redirect('/task');
};

module.exports.showTask = async(req, res)=>{
    const {id} = req.params;
    const task = await Task.findById(id);
    if(!task){
        req.flash('error', 'Task not found');
        return res.redirect('/task');
    }
    res.render('student/task/show', {task});
};


module.exports.showPage = async(req, res)=>{
    const task = await Task.findById(req.params.id);
    res.render('student/task/show', {task})
}