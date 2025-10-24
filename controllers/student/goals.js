const Goals = require('../../models/student/goals');
const {goalPlanner} = require('../../AI/goals')

module.exports.newForm = (req, res)=>{
    res.render('student/goals/new')
}

module.exports.savegoals = async(req, res)=>{
    const {title, description, category, targetDate, progress, status, milestones, motivation} = req.body;
    const plan = await goalPlanner(description, title, category,motivation,milestones);
    console.log(plan)
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
        res.redirect('/goals')
    }

    res.render('student/goals//edit')
}
//CANT ADD MILESTONE IN THE SHOW PAGE.
// CHECK OUT THE SHOW PAGE.