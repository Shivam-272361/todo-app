import axios from "axios";
import React from 'react'
import { useState, useEffect } from 'react'

const TodoApp = () => {
    const [todoData, setTodoData] = useState({
        title: "",
        description: "",
        priority: "low",
        dueDate: "",
        completed: false,
    })

    const [todos, setTodos] = useState([]);

    useEffect(() => {
        const fetchTodos = async () => {
            try {
                const response = await axios.get("http://localhost:3000/api/v1/getTodo");
                console.log("TODOS:", response.data);
                setTodos(response.data.data);
            } catch (error) {
                console.log(error);
            }
        }
        fetchTodos();
    }, []);
    const changeHandler = (e) => {
        const { name, value, type, checked } = e.target;
        setTodoData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }))

    }
    const deleteTodos = async (id) => {
        try {

            await axios.delete(`http://localhost:3000/api/v1/delete/${id}`);

            setTodos((prev) => prev.filter(todo => todo._id !== id));

        } catch (error) {
            console.log(error);
        }
    }
    const submitHandler = async (e) => {
        e.preventDefault();
        console.log(todoData);
        try {
            const response = await axios.post("http://localhost:3000/api/v1/create", todoData);

            console.log("Todo Created :", response.data);
        } catch (error) {
            console.log(error);
        }
    }
const toggleComplete = async (todo) => {
    try {

        const response = await axios.put(
            `http://localhost:3000/api/v1/update/${todo._id}`,
            { completed: !todo.completed }
        );

        setTodos(prev =>
            prev.map(t =>
                t._id === todo._id ? response.data.data : t
            )
        );

    } catch (error) {
        console.log(error);
    }
};

    return (
        <div>
            <h1 className='text-7xl font-bold font-sans'>My Todos</h1>
            <br />
            <form action="Todo" onSubmit={submitHandler}>
                <input type="text"
                    placeholder='Add Task Title'
                    name="title"
                    onChange={changeHandler}
                    value={todoData.title}
                    className='border rounded-2xl shadow text-white p-4'
                />
                <input type="text"
                    placeholder='Add Task Description'
                    name="description"
                    onChange={changeHandler}
                    value={todoData.description}
                    className='border rounded-2xl shadow text-white p-4'
                />
                <select name="priority" id="" className='border rounded-2xl shadow text-white p-4' onChange={changeHandler} value={todoData.priority}>
                    <option className="text-black" value="low">Low</option>
                    <option className="text-black" value="Medium">Medium</option>
                    <option className="text-black" value="low">High</option>
                </select>
                <br />
                <label htmlFor="dueDate">Due Date :</label>
                <input type="date"
                    placeholder='Due Date'
                    name='dueDate'
                    onChange={changeHandler}
                    value={todoData.dueDate}
                    className='border rounded-2xl shadow text-white p-4'
                />
                <label htmlFor="completed">Completed :</label>
                <input type="checkbox" name="completed" className='border rounded-2xl shadow text-white p-4' onChange={changeHandler} checked={todoData.completed} />
                <button type='submit' className='border rounded-2xl shadow text-white p-4 hover:text-black bg-blue-600'>Submit</button>
            </form>
            <br />
            <br />
            <br />
            <div className="text-white text-center">
                {
                    todos.map((todo) => (
                        <div key={todo._id}>
                            <h3>{todo.title}</h3>
                            <p>{todo.description}</p>
                            <p>{todo.priority}</p>
                            <p>{new Date(todo.dueDate).toISOString().split("T")[0]}</p>

                            <input
                                type="checkbox"
                                checked={todo.completed}
                                onChange={() => toggleComplete(todo)}
                            />
                            <button
                                onClick={() => deleteTodos(todo._id)}
                                className="border rounded p-3 text-2xl"
                            >
                                DELETE
                            </button>

                            <br />
                        </div>
                    ))
                }
            </div>
        </div>
    )
}

export default TodoApp
