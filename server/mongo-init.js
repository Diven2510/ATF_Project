// MongoDB initialization script
// This script runs when the MongoDB container starts for the first time

// Switch to the online-judge database
db = db.getSiblingDB('online-judge');

// Create collections if they don't exist
db.createCollection('users');
db.createCollection('problems');
db.createCollection('submissions');

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.problems.createIndex({ "title": 1 });
db.submissions.createIndex({ "userId": 1, "problemId": 1, "language": 1 });
db.submissions.createIndex({ "submittedAt": -1 });

print('MongoDB initialization completed successfully!'); 