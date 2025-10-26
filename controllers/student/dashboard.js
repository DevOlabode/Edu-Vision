// controllers/dashboard.js
const Goals = require('../../models/student/goals');
const Task = require('../../models/student/task');
const Material = require('../../models/student/material');

module.exports.mainDashboard = async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    
    // Fetch everything
    const goals = await Goals.find({ createdBy: userId }).sort('-createdAt');
    const tasks = await Task.find({ createdBy: userId }).sort('dueDate');
    const materials = await Material.find({ uploadedBy: userId }).sort('-createdAt').limit(5);
    
    // Calculate overall stats
    const stats = {
      // Goals overview
      goals: {
        total: goals.length,
        active: goals.filter(g => g.status === 'in-progress').length,
        completed: goals.filter(g => g.status === 'completed').length,
        atRisk: goals.filter(g => calculateSuccessProbability(g) < 50).length,
        averageProgress: goals.length > 0 
          ? Math.round(goals.reduce((sum, g) => sum + (g.progress || 0), 0) / goals.length)
          : 0
      },
      
      // Tasks overview
      tasks: {
        total: tasks.length,
        completed: tasks.filter(t => t.status === 'completed').length,
        pending: tasks.filter(t => t.status !== 'completed').length,
        overdue: tasks.filter(t => new Date(t.dueDate) < now && t.status !== 'completed').length,
        dueSoon: tasks.filter(t => {
          const daysUntil = (new Date(t.dueDate) - now) / (1000*60*60*24);
          return daysUntil <= 3 && daysUntil > 0 && t.status !== 'completed';
        }).length
      },
      
      // Materials overview
      materials: {
        total: materials.length,
        recentUploads: materials.filter(m => 
          (now - new Date(m.createdAt)) / (1000*60*60*24) <= 7
        ).length
      },
      
      // Activity overview
      activity: {
        streak: calculateCurrentStreak(goals, tasks),
        lastActivity: getLastActivityDate(goals, tasks),
        studyHoursThisWeek: 0 // TODO: Implement when you add time tracking
      },
      
      // Success metrics
      success: {
        completionRate: tasks.length > 0
          ? Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100)
          : 0,
        onTimeRate: calculateOnTimeRate(tasks),
        overallSuccessRate: calculateOverallSuccessRate(goals, tasks),
        productivityScore: calculateProductivityScore(goals, tasks)
      }
    };
    
    // Link tasks to goals
    const goalsWithTasks = goals.map(goal => ({
      ...goal.toObject(),
      relatedTasks: tasks.filter(t => t.relatedGoalId?.equals(goal._id)),
      tasksCompleted: tasks.filter(t => t.relatedGoalId?.equals(goal._id) && t.status === 'completed').length
    }));
    
    // Get urgent items
    const urgentItems = getUrgentItems(goals, tasks);
    
    res.render('student/dashboard/main', { 
      stats, 
      goals: goalsWithTasks, 
      tasks, 
      materials,
      urgentItems
    });
    
  } catch (error) {
    console.error('Dashboard error:', error);
    req.flash('error', 'Failed to load dashboard');
    res.redirect('/');
  }
};

function calculateSuccessProbability(goal) {
  const now = Date.now();
  const created = new Date(goal.createdAt).getTime();
  const target = new Date(goal.targetDate).getTime();
  
  const daysElapsed = (now - created) / (1000*60*60*24);
  const daysTotal = (target - created) / (1000*60*60*24);
  
  if (daysTotal <= 0 || daysElapsed < 0) return 0;
  
  // Calculate pace score (40% weight)
  const progressRate = (goal.progress || 0) / Math.max(daysElapsed, 1);
  const requiredRate = 100 / daysTotal;
  const paceScore = Math.min(100, (progressRate / requiredRate) * 40);
  
  // Calculate milestone score (30% weight)
  const milestonesCompleted = goal.milestones?.filter(m => m.completed).length || 0;
  const milestonesTotal = goal.milestones?.length || 1;
  const milestoneScore = (milestonesCompleted / milestonesTotal) * 30;
  
  // Consistency score (20% weight) - simplified for now
  const consistencyScore = 20;
  
  // Difficulty adjustment (10% weight)
  const difficultyBonus = goal.difficulty === 'easy' ? 10 : 
                          goal.difficulty === 'hard' ? -10 : 0;
  
  const probability = paceScore + milestoneScore + consistencyScore + difficultyBonus;
  
  return Math.max(0, Math.min(100, probability));
}

// Get urgent items that need attention
function getUrgentItems(goals, tasks) {
  const now = new Date();
  const urgent = [];
  
  // Check for urgent tasks (due within 24 hours)
  tasks.forEach(task => {
    if (task.status === 'completed') return;
    
    const hoursUntilDue = (new Date(task.dueDate) - now) / (1000*60*60);
    
    if (hoursUntilDue <= 24 && hoursUntilDue > 0) {
      urgent.push({
        type: 'task',
        item: task,
        urgency: 'critical',
        message: `Due in ${Math.round(hoursUntilDue)} hours!`,
        action: `/task/${task._id}`
      });
    }
  });
  
  // Check for overdue tasks
  tasks.forEach(task => {
    if (task.status === 'completed') return;
    
    if (new Date(task.dueDate) < now) {
      const daysOverdue = Math.floor((now - new Date(task.dueDate)) / (1000*60*60*24));
      urgent.push({
        type: 'task',
        item: task,
        urgency: 'critical',
        message: `Overdue by ${daysOverdue} day${daysOverdue !== 1 ? 's' : ''}!`,
        action: `/task/${task._id}`
      });
    }
  });
  
  // Check for goals at risk
  goals.forEach(goal => {
    if (goal.status !== 'in-progress') return;
    
    const probability = calculateSuccessProbability(goal);
    if (probability < 40) {
      urgent.push({
        type: 'goal',
        item: goal,
        urgency: 'high',
        message: `Only ${Math.round(probability)}% likely to succeed`,
        action: `/goals/${goal._id}`
      });
    }
  });
  
  // Check for goals with approaching deadlines and low progress
  goals.forEach(goal => {
    if (goal.status !== 'in-progress') return;
    
    const daysUntilDue = (new Date(goal.targetDate) - now) / (1000*60*60*24);
    const progress = goal.progress || 0;
    
    if (daysUntilDue <= 7 && daysUntilDue > 0 && progress < 50) {
      urgent.push({
        type: 'goal',
        item: goal,
        urgency: 'high',
        message: `Due in ${Math.round(daysUntilDue)} days but only ${progress}% complete`,
        action: `/goals/${goal._id}`
      });
    }
  });
  
  // Sort by urgency (critical first, then high, then medium)
  const urgencyOrder = { critical: 0, high: 1, medium: 2 };
  return urgent
    .sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency])
    .slice(0, 5); // Return top 5 most urgent items
}

// Calculate current streak
function calculateCurrentStreak(goals, tasks) {
  // Simple implementation - counts consecutive days with activity
  // In a real app, you'd track actual activity logs
  
  const allItems = [
    ...goals.map(g => ({ date: new Date(g.updatedAt || g.createdAt) })),
    ...tasks.map(t => ({ date: new Date(t.updatedAt || t.createdAt) }))
  ];
  
  if (allItems.length === 0) return 0;
  
  // Sort by date descending
  allItems.sort((a, b) => b.date - a.date);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let streak = 0;
  let currentDate = new Date(today);
  
  // Count consecutive days
  for (let i = 0; i < 30; i++) { // Check last 30 days
    const hasActivity = allItems.some(item => {
      const itemDate = new Date(item.date);
      itemDate.setHours(0, 0, 0, 0);
      return itemDate.getTime() === currentDate.getTime();
    });
    
    if (hasActivity) {
      streak++;
    } else if (streak > 0) {
      break; // Streak broken
    }
    
    currentDate.setDate(currentDate.getDate() - 1);
  }
  
  return streak;
}

// Get last activity date
function getLastActivityDate(goals, tasks) {
  const dates = [];
  
  goals.forEach(g => {
    if (g.updatedAt) dates.push(new Date(g.updatedAt));
  });
  
  tasks.forEach(t => {
    if (t.updatedAt) dates.push(new Date(t.updatedAt));
  });
  
  if (dates.length === 0) return null;
  
  return new Date(Math.max(...dates));
}

// Calculate on-time completion rate for tasks
function calculateOnTimeRate(tasks) {
  const completedTasks = tasks.filter(t => t.status === 'completed');
  if (completedTasks.length === 0) return 0;
  
  // For now, assume all completed tasks were on time
  // In a real app, you'd track actual completion date vs due date
  const onTimeTasks = completedTasks.filter(t => {
    // If you add a 'completedAt' field, compare it with dueDate
    // For now, return true for all completed
    return true;
  });
  
  return Math.round((onTimeTasks.length / completedTasks.length) * 100);
}

// Calculate overall success rate (goals and tasks combined)
function calculateOverallSuccessRate(goals, tasks) {
  const completedGoals = goals.filter(g => g.status === 'completed').length;
  const totalGoals = goals.filter(g => g.status !== 'abandoned').length;
  
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const totalTasks = tasks.length;
  
  const totalCompleted = completedGoals + completedTasks;
  const totalItems = totalGoals + totalTasks;
  
  if (totalItems === 0) return 0;
  
  return Math.round((totalCompleted / totalItems) * 100);
}

// Calculate productivity score (0-100)
function calculateProductivityScore(goals, tasks) {
  let score = 0;
  
  // Factor 1: Completion rate (40 points)
  const completionRate = calculateOverallSuccessRate(goals, tasks);
  score += (completionRate / 100) * 40;
  
  // Factor 2: Active goals progress (30 points)
  const activeGoals = goals.filter(g => g.status === 'in-progress');
  if (activeGoals.length > 0) {
    const avgProgress = activeGoals.reduce((sum, g) => sum + (g.progress || 0), 0) / activeGoals.length;
    score += (avgProgress / 100) * 30;
  }
  
  // Factor 3: Task completion velocity (20 points)
  const recentTasks = tasks.filter(t => {
    const daysSinceCreated = (Date.now() - new Date(t.createdAt)) / (1000*60*60*24);
    return daysSinceCreated <= 30; // Last 30 days
  });
  
  if (recentTasks.length > 0) {
    const completedRecent = recentTasks.filter(t => t.status === 'completed').length;
    score += (completedRecent / recentTasks.length) * 20;
  }
  
  // Factor 4: No overdue items bonus (10 points)
  const overdueTasks = tasks.filter(t => 
    new Date(t.dueDate) < new Date() && t.status !== 'completed'
  );
  if (overdueTasks.length === 0 && tasks.length > 0) {
    score += 10;
  }
  
  return Math.round(Math.max(0, Math.min(100, score)));
}

// Export the main function
module.exports = {
  mainDashboard: module.exports.mainDashboard
};