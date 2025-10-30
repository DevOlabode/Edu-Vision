const Task = require('../../models/student/task');
const {taskPlanner} = require('../../AI/task');
const { summarizer } = require('../../AI/summarise');

module.exports.newTaskForm = (req, res)=>{
    res.render('student/task/newTask')
};

module.exports.allTasks = async(req, res) => {
  const { status, priority, subject, sortBy } = req.query;
  
  let query = { createdBy: req.user._id };
  
  if (status) query.status = status;
  if (priority) query.priority = priority;
  if (subject) query.subject = new RegExp(subject, 'i');
  
  let sortOption = {};
  switch(sortBy) {
    case 'dueDate': sortOption = { dueDate: 1 }; break;
    case 'priority': sortOption = { priority: -1 }; break;
    case 'created': sortOption = { createdAt: -1 }; break;
    default: sortOption = { dueDate: 1 };
  }
  
  const tasks = await Task.find(query).sort(sortOption);
  res.render('student/task/allTasks', { tasks });
};

module.exports.newTask = async(req, res)=>{
    const {title, subject, type, dueDate, description, priority, difficulty, milestones} = req.body;

    const plan = await taskPlanner(title, subject, type, dueDate, description, priority, difficulty, milestones);

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

    // Add at the end of newTask function
    const notificationService = require('../../services/notificationService');
    await notificationService.createNotification({
    userId: req.user._id,
    type: 'task',
    title: '📝 New Task Created',
    message: `Task "${task.title}" is due ${new Date(task.dueDate).toLocaleDateString()}`,
    link: `/task/${task._id}`,
    icon: '✨'
    });

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

module.exports.getMilestoneNote = async (req, res) => {
    const { id, milestoneId } = req.params;
    const task = await Task.findById(id);
    if (!task) {
        return res.status(404).json({ error: 'Task not found' });
    }
    const milestone = task.milestones.id(milestoneId);
    if (!milestone) {
        return res.status(404).json({ error: 'Milestone not found' });
    }
    res.json({ note: milestone.notes || '' });
};

module.exports.saveMilestoneNote = async (req, res) => {
    const { id, milestoneId } = req.params;
    const { note } = req.body;
    const task = await Task.findById(id);
    if (!task) {
        return res.status(404).json({ error: 'Task not found' });
    }
    const milestone = task.milestones.id(milestoneId);
    if (!milestone) {
        return res.status(404).json({ error: 'Milestone not found' });
    }
    milestone.notes = note;
    await task.save();
    req.flash('success', 'Milestone note saved!');
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

module.exports.editForm = async(req, res)=>{
    const task = await Task.findById(req. params.id);

    if(!task) {
        req.flash('error', 'Task Not Found');
        res.redirect('/task')
    }

    res.render('student/task/edit', { task })
}

module.exports.edit = async(req, res)=>{
    const { id } = req.params;
    const {title, subject, type, dueDate, description, priority, difficulty, milestones} = req.body;

    const task = await Task.findById(id);

    if(!task){
        req.flash('error', 'Task Not Found');
        res.redirect(`/task/${task._id}`)
    }
    
    const plan = await taskPlanner(title, subject, type, dueDate, description, priority, difficulty, milestones);

    const update = await Task.findByIdAndUpdate(req.params.id,
        {
            ...req.body,
            planner : plan
        },
        {
            runValidators: true,
            new: true,
        }
    );

    req.flash('success', 'Updated Task Successfully');
    res.redirect(`/task/${update._id}`)
}



module.exports.Task = Task;