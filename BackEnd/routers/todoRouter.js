const express =require("express");
const router = express.Router();

const {createTodo} = require("../controllers/TodoApp");
const {deleteTodo} = require("../controllers/TodoApp");
const {updateTodo} = require("../controllers/TodoApp");
const {getTodo} = require("../controllers/TodoApp");
const {getTodoById} = require("../controllers/TodoApp");

router.post("/create",createTodo);
router.delete("/delete/:id",deleteTodo);
router.put("/update/:id",updateTodo);
router.get("/getTodo",getTodo);
router.get("/getById/:id",getTodoById);

module.exports = router;