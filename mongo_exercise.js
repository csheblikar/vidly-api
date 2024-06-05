const mongoose = require("mongoose");

// database connection
mongoose
  .connect("mongodb://localhost:27017/Playground")
  .then(() => console.log("Connected to MongoDb..."))
  .catch((err) => console.log("Could not connect to database...", err));

// create a course schema

// create author schema
const authorSchema = new mongoose.Schema({
  name: String,
  bio: String,
  website: String,
});

const courseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  author: [authorSchema],
});

// create a model
const Course = mongoose.model("Course", courseSchema);
const Author = mongoose.model("Author", authorSchema);

async function createCourse(name, authors) {
  // create an object
  let course = new Course({
    name: name,
    author: authors,
  });

  try {
    course = await course.save();
    console.log(course);
  } catch (ex) {
    console.log(ex.message);
  }
}

async function createAuthor() {
  let author = new Author({
    name: "Chai",
    website: "csheblikar.me",
    bio: "She is awesome",
  });

  author = await author.save();
  console.log(author);
}

async function listCourses() {
  const courses = await Course.find()
    .populate("author", "name -_id") // populate with author document and include only the name - id
    .select("name author"); // include only name and author

  console.log(courses);
}

// createAuthor();
createCourse("Android", [
  new Author({ name: "Chai" }),
  new Author({ name: "Sid" }),
]);
// listCourses();

// async function updateCourseById(id) {
//     // const course = await Course.findById(id);
//     // if (!course) return;

//     // course.set({
//     //     author: "Sid",
//     // });

//     // // save
//     // const newCourse = await course.save();
//     // console.log(newCourse);

//     const course = await Course.findOneAndUpdate(
//         { _id: id },
//         { author: "Sid" },
//         { new: true },
//     );
//     if (!course) return;

//     console.log(course);
// }

// updateCourseById("665ac3c7dbedd45f53cbcb37");
