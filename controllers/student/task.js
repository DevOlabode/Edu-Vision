const Task = require('../../models/student/task');
const {taskPlanner} = require('../../AI/task');

module.exports.newTaskForm = (req, res)=>{
    res.render('student/task/newTask')
};

module.exports.allTasks = async(req, res)=>{
    const tasks  = await Task.find();
    res.render('student/task/allTasks', {tasks})
}

module.exports.newTask = async(req, res)=>{
    const {title, subject, type, dueDate, description, priority, difficulty, milestones} = req.body;

    const plan = await taskPlanner(title, subject, type, dueDate, description, priority, difficulty, milestones);

    console.log(plan)

    const task = new Task({
        title,
        subject,
        type,
        dueDate,
        description,
        priority,
        difficulty,
        milestones: Array.isArray(milestones) ? milestones : [],
        createdBy: req.user._id,
        planner : plan
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
    console.log(task.planner)
    res.render('student/task/show', {task});
};

module.exports.addMilestone = async(req, res)=>{
    const {id} = req.params;
    const {title, dueDate} = req.body;
    const task = await Task.findById(id);
    if(!task){
        req.flash('error', 'Task not found');
        return res.redirect('/task');
    }
    task.milestones.push({title, dueDate, completed: false});
    await task.save();
    req.flash('success', 'Milestone added successfully!');
    res.redirect(`/task/${id}`);
};

module.exports.toggleMilestone = async(req, res)=>{
    const {id, milestoneIndex} = req.params;
    const task = await Task.findById(id);
    if(!task || !task.milestones[milestoneIndex]){
        req.flash('error', 'Task or milestone not found');
        return res.redirect('/task');
    }
    task.milestones[milestoneIndex].completed = !task.milestones[milestoneIndex].completed;
    await task.save();
    req.flash('success', 'Milestone status updated!');
    res.redirect(`/task/${id}`);
};


module.exports.showPage = async(req, res)=>{
    const task = await Task.findById(req.params.id);
    res.render('student/task/show', {task})
}

module.exports.delete = async(req, res)=>{
    const { id } = req.params;
    const task = await Task.findByIdAndDelete(id);

    req.flash('success', 'Deleted Task Successfully');
    res.redirect('/task')
}