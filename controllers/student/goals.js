const Goals = require('../../models/student/goals');
const {goalPlanner} = require('../../AI/goals')

module.exports.newForm = (req, res)=>{
    res.render('student/goals/new')
}

module.exports.savegoals = async(req, res)=>{
    const {title, description, category, targetDate, progress, status, milestones, motivation} = req.body;
    const plan = await goalPlanner(description, title, category,motivation,milestones);
    const goals = new Goals({
        title,
        description,
        category, 
        targetDate,
        progress,
        status, 
        motivation,
        createdBy : req.user._id,
        tips : plan.studyTips,
        aiSuggestions : plan.suggestedPlan
    });
    await goals.save();
    res.redirect('/goals')
}

module.exports.allGoals = async(req, res)=>{
    const goals = await Goals.find();
    res.render('student/goals/all', { goals })
}

module.exports.showGoal = async(req, res)=>{
    const goal = await Goals.findById(req.params.id);

    if(!goal){
        req.flash('error', 'Goal Not Found')
        res.redirect('/goals')
    }

    res.render('student/goals/show', { goal })
};

module.exports.editForm = async(req, res) =>{
    const goal = await Goals.findById(req.params.id);

    if(!goal) {
        req.flash('error', 'Goal Not Found!')
        return res.redirect('/goals')
    }

    res.render('student/goals/edit', { goal })
};

module.exports.edit = async(req, res)=>{
    const {title, description, category, targetDate, progress, status, milestones, motivation} = req.body;
    const goal = await Goals.findById(req.params.id);

    if(!goal){
        req.flash('error', 'Goal Not Found');
        res.redirect(`/goals/${goal._id}`)
    };

    const plan = await goalPlanner(description, title, category,motivation,milestones);

    const update = await Goals.findByIdAndUpdate(req.params.id, 
        {
            ...req.body,
            createdBy : req.user._id,
            tips : plan.studyTips,
            aiSuggestion : plan.suggestedPlan
        },
        {
            runValidators: true,
            new: true,
        }
    );

    req.flash('success', 'Updated Goals Successfully');
    res.redirect(`/goals/${update._id}`)
};

module.exports.deleteGoal = async(req, res)=>{
    const goal = await Goals.findByIdAndDelete(req.params.id);

    req.flash('success', 'Deleted Goal Successfully');
    res.redirect('/goals')
}

// API endpoints for functionality
module.exports.updateProgress = async (req, res) => {
    const { id } = req.params;
    const { progress } = req.body;
    const goal = await Goals.findById(id);
    if (!goal) return res.status(404).json({ error: 'Goal not found' });

    goal.progress = progress;
    if (progress === 100) goal.status = 'completed';
    await goal.save();

    res.json({ progress: goal.progress, status: goal.status });
};

module.exports.addMilestone = async (req, res) => {
    const { id } = req.params;
    const { title, dueDate } = req.body;
    const goal = await Goals.findById(id);
    if (!goal) return res.status(404).json({ error: 'Goal not found' });

    goal.milestones.push({ title, dueDate, completed: false });
    await goal.save();

    res.json({ milestones: goal.milestones });
};

module.exports.updateMilestone = async (req, res) => {
    const { id } = req.params;
    const { index, title } = req.body;
    const goal = await Goals.findById(id);
    if (!goal || !goal.milestones[index]) return res.status(404).json({ error: 'Milestone not found' });

    goal.milestones[index].title = title;
    await goal.save();

    res.json({ milestones: goal.milestones });
};

module.exports.deleteMilestone = async (req, res) => {
    const { id } = req.params;
    const { index } = req.body;
    const goal = await Goals.findById(id);
    if (!goal || !goal.milestones[index]) return res.status(404).json({ error: 'Milestone not found' });

    goal.milestones.splice(index, 1);
    await goal.save();

    res.json({ milestones: goal.milestones });
};

module.exports.toggleMilestone = async (req, res) => {
    const { id } = req.params;
    const { index, completed } = req.body;
    const goal = await Goals.findById(id);
    if (!goal || !goal.milestones[index]) return res.status(404).json({ error: 'Milestone not found' });

    goal.milestones[index].completed = completed;
    await goal.save();

    res.json({ milestones: goal.milestones });
};

module.exports.markComplete = async (req, res) => {
    const { id } = req.params;
    const goal = await Goals.findById(id);
    if (!goal) return res.status(404).json({ error: 'Goal not found' });

    goal.status = 'completed';
    goal.progress = 100;
    await goal.save();

    res.json({ status: goal.status, progress: goal.progress });
};

module.exports.regeneratePlan = async (req, res) => {
    const { id } = req.params;
    const { title, subject, type, dueDate, priority, difficulty, description } = req.body;
    const goal = await Goals.findById(id);
    if (!goal) return res.status(404).json({ error: 'Goal not found' });

    const plan = await goalPlanner(description, title, subject, '', goal.milestones.map(m => m.title));
    goal.tips = plan.studyTips;
    goal.aiSuggestions = plan.suggestedPlan;
    await goal.save();

    res.json({ tips: goal.tips, aiSuggestions: goal.aiSuggestions });
};
