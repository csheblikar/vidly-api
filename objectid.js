// _id: 6244556fbadcbbae7a41197a

// 12 bytes
// 4 bytes: timestamp
// 3 bytes: machine identifier
// 2 bytes: process identifier
// 3 bytes: counter

const mongoose = require('mongoose');

const id = new mongoose.Types.ObjectId();
console.log(id.getTimestamp());

console.log(mongoose.Types.ObjectId.isValid('1234'));
