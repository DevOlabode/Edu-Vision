# TODO: Implement Google Drive Material Upload

## Step 1: Update User Model ✅
- Add `googleAccessToken` and `googleRefreshToken` fields to models/user.js

## Step 2: Modify OAuth Strategy ✅
- Update config/oauth.js to save access_token and refresh_token in User model during login

## Step 3: Add Google Picker to Frontend ✅
- Integrate Google Picker API script in views/student/upload/upload.ejs
- Add "Import from Google Drive" button in the upload form

## Step 4: Create Google Drive Upload Controller ✅
- Add new method `uploadFromDrive` in controllers/student/material.js
- Implement file fetching from Google Drive using file ID
- Pipe file to Cloudinary upload stream
- Extract text, generate summary, save to MongoDB

## Step 5: Add New Route ✅
- Add POST route for Google Drive upload in routes/student/material.js

## Step 6: Handle Token Refresh
- Implement token refresh logic in controller if access token is expired

## Step 7: Test Integration
- Enable Google Drive API and Picker API in Google Cloud Console
- Test the full flow from file selection to material creation
