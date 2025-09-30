// MongoDB initialization script
db = db.getSiblingDB('ai-interview-assistant');

// Create collections
db.createCollection('candidates');
db.createCollection('interviews');

// Create indexes for better performance
db.candidates.createIndex({ "email": 1 }, { unique: true });
db.candidates.createIndex({ "createdAt": -1 });
db.interviews.createIndex({ "candidateId": 1 });
db.interviews.createIndex({ "status": 1 });
db.interviews.createIndex({ "createdAt": -1 });

print('Database initialized successfully');