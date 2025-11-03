require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/user');

const connectDB = require('./config/database');

connectDB();

const testUsers = [
  {
    email: 'alice@example.com',
    username: 'alice',
    firstName: 'Alice',
    lastName: 'Johnson',
    timezone: 'UTC+00:00',
    role: 'Student',
    studyPreferences: {
      subjects: ['Mathematics', 'Physics', 'Computer Science'],
      availability: ['Evenings', 'Weekends'],
      goals: 'Improve problem-solving skills and prepare for exams'
    },
    password: 'alice123'
  },
  {
    email: 'bob@example.com',
    username: 'bob',
    firstName: 'Bob',
    lastName: 'Smith',
    timezone: 'UTC+00:00',
    role: 'Student',
    studyPreferences: {
      subjects: ['Mathematics', 'Chemistry', 'Biology'],
      availability: ['Evenings', 'Weekends'],
      goals: 'Master advanced concepts and get better grades'
    },
    password: 'bob123'
  },
  {
    email: 'charlie@example.com',
    username: 'charlie',
    firstName: 'Charlie',
    lastName: 'Brown',
    timezone: 'UTC+01:00',
    role: 'Student',
    studyPreferences: {
      subjects: ['English', 'History', 'Geography'],
      availability: ['Mornings', 'Afternoons'],
      goals: 'Improve writing skills and understanding of literature'
    },
    password: 'charlie123'
  },
  {
    email: 'diana@example.com',
    username: 'diana',
    firstName: 'Diana',
    lastName: 'Prince',
    timezone: 'UTC-05:00',
    role: 'Student',
    studyPreferences: {
      subjects: ['Mathematics', 'Computer Science', 'Statistics'],
      availability: ['Evenings', 'Weekends'],
      goals: 'Learn programming and data analysis'
    },
    password: 'diana123'
  }
];

async function seedUsers() {
  try {
    await User.deleteMany({}); // Optional: clear existing users

    for (const userData of testUsers) {
      const { password, ...profile } = userData;
      await User.register(new User(profile), password);
    }

    console.log('Test users created with passwords');
  } catch (err) {
    console.error('Error creating users:', err);
  } finally {
    mongoose.connection.close();
  }
}

seedUsers()