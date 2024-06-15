const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL|| 'postgres://postgres:admin@localhost:5432/afm_db',
    ssl: !!process.env.DATABASE_URL
})

const getTasks = async (req,res)=>{
    const author_id = req.author_id;
    console.log(author_id)
    try
    {
        const response = await pool.query('SELECT * FROM tasks WHERE author_id = $1', [author_id]);
        res.status(200).json(response.rows);
    }
    catch(error){
        console.log(error);
        res.send("Error: "+error);
    }
};

const createTask = async (req, res) => {
    const { title, description, deadline } = req.body;
    const author_id = req.author_id;

    try {
        const response = await pool.query(
            'INSERT INTO tasks (title, description, deadline, author_id, is_active) VALUES ($1, $2, $3, $4, true) RETURNING *',
            [title, description, deadline, author_id]
        );
        const task = response.rows[0];
        res.status(201).json({
            message: 'Task Added Successfully',
            body: {
                task: task
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).send("Error: " + error);
    }
};

const deleteTask = async (req, res) => {
    const id = req.params.id;
    try {
        const response = await pool.query('DELETE FROM tasks WHERE uuid = $1', [id]);
        console.log(response);
        res.json(`Task ${id} deleted successfully`);
    } catch (error) {
        console.log(error);
        res.status(500).send("Error: " + error);
    }
};

const updateTask = async (req, res) => {
    const id = req.params.id;
    const { title, description, deadline } = req.body;
    try {
        const response = await pool.query(
            'UPDATE tasks SET title = $1, description = $2, deadline = $3 WHERE uuid = $4 RETURNING *',
            [title, description, deadline, id]
        );
        console.log(response);
        res.json('Task updated successfully');
    } catch (error) {
        console.log(error);
        res.status(500).send("Error: " + error);
    }
};
const changeStatus = async (req, res) => {
    const id = req.params.id;
    try {
        // Fetch current task details
        const fetchTaskQuery = 'SELECT * FROM tasks WHERE uuid = $1';
        const fetchTaskResponse = await pool.query(fetchTaskQuery, [id]);
        const currentTask = fetchTaskResponse.rows[0];

        // Toggle is_active field
        const newStatus = !currentTask.is_active;

        // Update task with new status
        const updateTaskQuery = 'UPDATE tasks SET is_active = $1 WHERE uuid = $2 RETURNING *';
        const response = await pool.query(updateTaskQuery, [newStatus, id]);

        console.log(response);
        res.json('Task status updated successfully');
    } catch (error) {
        console.log(error);
        res.status(500).send("Error: " + error);
    }
};

module.exports = {
    getTasks,
    createTask,
    deleteTask,
    updateTask,
    changeStatus
};