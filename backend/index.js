// ---------------- ↓ SETTING UP DEPENDENCIES ↓----------
require("dotenv").config();
const express = require("express"); // Enables use of Express.js
const cors = require("cors"); //Enables Cross Origin Resource Sharing
const mongoose = require("mongoose"); //Enables use of MongoDB


// --------------- ↓ INITIAL APP CONFIGURATION ↓ --------------
const port = process.env.PORT || 3000; //Uses port number on device to serve the backed (Live)
const app = express(); // using Express.js to power the app


// --------------- ↓ MIDDLEWARE SETUP ↓ ------------------
app.use(express.json()); // Uses express in Json Format
app.use(cors('*')); // Enables use of CORS - * means every domain is now allowed access to this server to send and receive data - not secure - * is for development only



// --------------- ↓ DATABASE CONNECTION + APP STARTUP ↓ ------------------

(async () => {
    try {
        mongoose.set("autoIndex", false);

        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB Connected!");

        await Task.syncIndexes();
        console.log("Indexes Created")
        
        app.listen(port,() =>{
            console.log(`To Do App is live on port ${port}`)
        });

    } catch (error) {
       console.error("Startup error:", error);
       process.exit(1); //Shutdown the server
    }
})();
    


// Define the task Schema (data structure)
const taskSchema = new mongoose.Schema({
    title: {type: String, required: true},
    description: {type: String, required: true},
    dueDate: {type: Date, required: true},
    createdOn: {type: Date, default: Date.now, required: true},
    completed: {type: Boolean, required: true, default: false}
});


taskSchema.index({ dueDate: 1 });
taskSchema.index({dateCreated: 1 });


// create a "Task" model to be used in the database
const Task = mongoose.model("Task", taskSchema);






// --------------- ↓ API ROUTES ↓ -------------------







// --------------- ↓ TASK ROUTES ↓ ---------------
// let taskId = 1;
// const tasks = [
//     {id: taskId++, completed: true, title: "wash car", description: "My car is filthy and needs its annual clean", dueDate: "10/05/2025", createdOn: "28/07/2025"},
//     {id: taskId++, completed: true, title: "Eat", description: "I need to eat", dueDate: "11/05/2025", createdOn: "29/07/2025"}
// ];



// Get all the tasks
app.get("/tasks", async (req, res) =>{
    try {
        const {sortBy} = req.query; // ?sort by =DueDate or ?sort by=Date created

        let sortOption = {};

        if (sortBy === "dueDate") {
            sortOption = {dueDate: 1 } //Ascending
        } else if (sortBy === "dateCreated") {
            sortOption = {dateCreated:1};
        }


        const tasks = await Task.find({});
        res.json(tasks)
    } catch (error) {
      console.error("Error:", err)
      res.status(500).json({message: "Error grabbing tasks!"});
    }
});




// Create a new task and add it to the array
app.post("/tasks/todo", async (req, res) => {
    try{
      const {title, description, dueDate} = req.body;
      
      const taskData = { title, description, dueDate }; //grabs data
      const createTask = new Task(taskData); //creates a new "Task" model with the data grabbed
      const newTask = await createTask.save(); //saves the new task to the database

      res.json({ task: newTask, message: "New task created successfully!"});



      
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: "Error creating the task!"});
    }
});


// To complete the task

app.patch("/tasks/complete/:id", async (req, res) => {
    try {
        const { completed } = req.body;
        const taskId = req.params.id;

        const completedTask = await Task.findByIdAndUpdate(taskId, {completed}, {new: true });

        if (!completedTask) {
            return res.status(404).json({ message: "Task not found" });
        }

        res.json({ task: completedTask, message: "Task set to 'complete' !"});

    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({message: "Error completing the task!"});
    }
})




// To not-complete the task

app.patch("/tasks/notComplete/:id", async (req, res) => {
    try {
        const { completed } = req.body;
        const taskId = req.params.id;

        const taskNotComplete = await Task.findByIdAndUpdate(taskId, {completed}, {new: true });

        if (!taskNotComplete) {
            return res.status(404).json({ message: "Task not found" });
        }

        res.json({ task: taskNotComplete, message: "Task set to 'not complete' !"});

    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({message: "Error setting the task to not complete!"});
    }
})



// To Delete the task
app.delete("/tasks/delete/:id", async (req, res) => {
    try {        
        const taskId = req.params.id;

        const deletedTask = await Task.findByIdAndDelete(taskId);

        if (!deletedTask) {
            return res.status(404).json({ message: "Task not found" });
        }

        res.json({ task: deletedTask, message: "Task Deleted successfully" });

    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({message: "Error Deleting the task!"});
    }
})


// To Edit/update the task and change values

app.put("/tasks/update/:id", async (req, res) => {
    try {        
        const taskId = req.params.id;
        const { title, description, dueDate } = req.body;

        const taskData = {title, description, dueDate};

        const updatedTask = await Task.findByIdAndUpdate(taskId, taskData, {new: true });

        if (!updatedTask) {
            return res.status(404).json({ message: "Task not found" });
        }

        res.json({ task: updatedTask, message: "Task updated successfully!" });

    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({message: "Error editting the task!"});
    }
})





//CRUD
// CREATE
// READ
// UPDATE
// DELETE



// GET
// PATCH
// POST
// DELETE
// PUT






// -------------- ↓ APP STARTUP ↓ -----------------
