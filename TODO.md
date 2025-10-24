# TODO: Restyle Goal Show Page and Fix Functionality

## Backend Fixes
- [ ] Add API routes in routes/student/goals.js for progress, milestones, complete, and generate-plan endpoints
- [ ] Implement controller methods in controllers/student/goals.js for updateProgress, addMilestone, updateMilestone, deleteMilestone, toggleMilestone, markComplete, regeneratePlan

## Frontend Updates
- [ ] Update URLs in views/student/goals/show.ejs from '/task/' to '/goals/'

## Restyling
- [ ] Update color scheme in show.ejs: Softer gradients, better contrast
- [ ] Add animations: Fade-ins, progress bar animations, hover effects
- [ ] Improve layout: Better spacing, responsive grid, icons
- [ ] Enhance UX: Loading states, better forms

## Testing
- [ ] Test milestones functionality (add, edit, delete, toggle)
- [ ] Test progress updates and marking complete
- [ ] Test AI plan regeneration
- [ ] Verify responsiveness on mobile
- [ ] Check for console errors
