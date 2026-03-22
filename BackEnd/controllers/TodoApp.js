const Todo = require("../models/todos");

exports.createTodo = async (req, res) => {
    try {

        const { title, description, completed, priority, dueDate } = req.body;

        if (!title) {
            return res.status(400).json({
                success: false,
                message: "Title is required"
            });
        }

        const todo = await Todo.create({
            title,
            description,
            completed ,
            priority,
            dueDate,
        });

        res.status(201).json({
            success: true,
            message: "Todo created successfully",
            data: todo
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
}

exports.deleteTodo = async (req, res) => {
    try {
        const { id } = req.params;
        const todo = await Todo.findByIdAndDelete(id);
        if (!todo) {
            res.status(404).json({
                success: false,
                message: "Todo not found",
            })
        }

        res.status(200).json({
            success: true,
            message: "todo deleted Successfully",
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}


exports.updateTodo = async (req, res) => {
    try {

        const { id } = req.params;

        const updatedTodo = await Todo.findByIdAndUpdate(
            id,
            req.body,
            { new: true }
        );

        if (!updatedTodo) {
            return res.status(404).json({
                success: false,
                message: "Todo not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Todo updated successfully",
            data: updatedTodo
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
}

exports.getTodo = async (req, res) => {
    try {
        const todos = await Todo.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            message: "Todos Fetched Successfully",
            data : todos,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }

}

exports.getTodoById = async (req, res) => {
    try {
        const { id } = req.params;
        const todo = await Todo.findById(id);
        if (!todo) {
            res.status(400).json({
                success: false,
                message: "Todo Doesnt Exist"
            })
        }
        res.status(200).json({
            success: true,
            message: "Todos Fetched Successfully",
            data: todo,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }

}