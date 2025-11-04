const mongoose = require('mongoose');
const User = require('./models/user');
const connectDB = require('./config/database');
require('dotenv').config();

connectDB();

const users = [
  {
    firstName: 'Zara',
    lastName: 'Khan',
    username : 'Kahn',
    email: 'zara.khan@example.com',
    password: 'zaraPass2025',
    studyPreferences: {
      subjects: ['Economics', 'Math'],
      availability: ['Sunday Morning', 'Tuesday Afternoon', 'Flexible'],
      goals: ['Ace final exams', 'Understand microeconomics']
    }
  },
  {
    firstName: 'Leo',
    lastName: 'Mendez',
    username : 'Lei',
    email: 'leo.mendez@example.com',
    password: 'leoSecure456',
    studyPreferences: {
      subjects: ['Computer Science', 'Physics'],
      availability: ['Monday Evening', 'Thursday Morning', 'Flexible'],
      goals: ['Build a portfolio', 'Prepare for university']
    }
  },
  {
    firstName: 'Amara',
    username : 'Okafor',
    lastName: 'Okafor',
    email: 'amara.okafor@example.com',
    password: 'amaraStrong789',
    studyPreferences: {
      subjects: ['History', 'English'],
      availability: ['Wednesday Afternoon', 'Saturday Evening', 'Flexible'],
      goals: ['Improve writing', 'Debate competition prep']
    }
  },
  {
    firstName: 'Tobias',
    lastName: 'Chen',
    email: 'tobias.chen@example.com',
    username : 'Chen',
    password: 'tobiasCode321',
    studyPreferences: {
      subjects: ['Math', 'Computer Science'],
      availability: ['Friday Morning', 'Sunday Evening', 'Flexible'],
      goals: ['Hackathon prep', 'Master algorithms']
    }
  },
  {
    firstName: 'Nia',
    lastName: 'Robinson',
    email: 'nia.robinson@example.com',
    password: 'niaFocus654',
    username : 'Nia',
    studyPreferences: {
      subjects: ['Biology', 'Chemistry'],
      availability: ['Tuesday Morning', 'Thursday Evening','Flexible'],
      goals: ['Lab skills', 'Medical school prep']
    }
  }
];

async function seedUsers() {
  try {
    await User.insertMany(users);
    console.log('New users seeded successfully');
  } catch (err) {
    console.error('Error seeding users:', err);
  } finally {
    mongoose.connection.close();
  }
}

seedUsers();