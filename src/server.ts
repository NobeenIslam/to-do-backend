import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import filePath from "./filePath";

const app = express();

/** Parses JSON data in a request automatically */
app.use(express.json());
/** To allow 'Cross-Origin Resource Sharing': https://en.wikipedia.org/wiki/Cross-origin_resource_sharing */
app.use(cors());

// read in contents of any senvironment variables in the .env file
dotenv.config();

// use the environment variable PORT, or 4000 as a fallback
const PORT_NUMBER = process.env.PORT;

// API info page

interface task {
  taskName: string;
  id: string;
}

let idCounter = 0;
let tasks: task[] = [];

app.get("/", (req, res) => {
  const pathToFile = filePath("../public/index.html");
  res.sendFile(pathToFile);
});

app.get("/tasks", (req, res) => {
  res.status(201).json(tasks);
});

app.post<{}, {}, task>("/tasks", (req, res) => {
  const newTask = req.body;
  const newId = (idCounter += 1);
  newTask.id = newId.toString();

  if (newTask.taskName === "") {
    res.status(400).send("There doesn't seem to be a joke here");
    return;
  }

  tasks.push(newTask);
  res.status(201).json(newTask);
});

app.patch<{ id: string }, {}, { taskName: string }>(
  "/tasks/:id",
  (req, res) => {
    const updatedTaskName = req.body;
    const idToUpdate = req.params.id;
    const indexToUpdate = tasks.findIndex((task) => task.id === idToUpdate);

    if (indexToUpdate < 0) {
      res.status(400).send("Sorry mate, this task aint there");
      return;
    }
    const taskToUpdate = tasks[indexToUpdate]
    taskToUpdate["taskName"] = updatedTaskName.taskName;

    res.status(201).json(tasks[indexToUpdate]);
  }
);

app.delete<{ id: string }, {}, {}>("/tasks/:id", (req, res) => {
  const idToDelete = req.params.id;
  const indexToDelete = tasks.findIndex((task) => task.id === idToDelete);

  if (indexToDelete < 0) {
    res.status(400).send("Sorry mate, this task aint there");
    return;
  }

  tasks.splice(indexToDelete, 1);
  res.status(201).send(`Congrats, you deleted a task`);
});

app.delete<{}, {}, {}>("/tasks", (req, res) => {
  tasks = [];
  idCounter = 0;
  res.status(201).send("You have deleted all your tasks");
});

app.listen(PORT_NUMBER, () => {
  console.log(`Server is listening on port ${PORT_NUMBER}!`);
});
