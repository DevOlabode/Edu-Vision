# TODO: Add Task Feature to Frontend

## Information Gathered
- **Navbar Structure**: Located in `views/partials/navbar.ejs`, contains navigation links for Home, Upload, Materials for logged-in users.
- **Task Routes**: Task management routes exist under `/task` (allTasks, newTask, show, etc.).
- **Current Access**: Task features are backend-ready but not accessible from the frontend navigation.

## Plan
- **Edit `views/partials/navbar.ejs`**:
  - Add a "Tasks" navigation link between "Upload" and "Materials" for logged-in users.
  - Use consistent styling with other nav links (icon, text, hover effects).

## Dependent Files to Edit
- `views/partials/navbar.ejs`: Add Tasks link to navigation menu.

## Followup Steps
- Test the navbar by running the application and verifying the Tasks link appears for logged-in users.
- Click the link to ensure it navigates to the task management page.
- Check responsive design on mobile devices.
