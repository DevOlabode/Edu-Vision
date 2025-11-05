# TODO: Add Username Field for Google Registration

## Tasks
- [x] Update views/auth/completeProfile.ejs to include a username input field
- [x] Update controllers/auth.js completeProfile method to handle username validation and saving
- [x] Ensure username uniqueness check in the controller
- [x] Test the Google OAuth registration flow to verify username is requested

## Notes
- Username is required in the User model
- Google OAuth currently doesn't set username, so new Google users need to provide it
- Add validation for username uniqueness and format
