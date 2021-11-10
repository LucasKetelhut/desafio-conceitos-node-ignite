const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  
  const user = users.find((user) => user.username === username);

  if (user) {
    request.user = user;
    return next();
  } else {
    return response.status(404).json({
      error: "User not found"
    });
  }
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExists = users.find(user => user.username === username);

  if (userAlreadyExists) {
    return response.status(400).json({
      error: 'User already exists'
    });
  }

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: []
  };

  users.push(newUser);

  return response.status(201).json(newUser);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const user = request.user;

  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const user = request.user;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  };

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { id } = request.params;
  const user = request.user;

  const doesTodoExists = user.todos.find(todo => todo.id === id);

  if (doesTodoExists) {
    for (i = 0; i < user.todos.length; i++) {
      if (user.todos[i].id === id) {
        user.todos[i].title = title;
        user.todos[i].deadline = deadline;
      } 
    }
    
    return response.status(200).json(doesTodoExists);

  } else {

    return response.status(404).json({
      error: "Todo doesn't exists"
    });

  }
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const user = request.user;

  const doesTodoExists = user.todos.find(todo => todo.id === id);

  if (doesTodoExists) {
    for (i = 0; i < user.todos.length; i++) {
      if (user.todos[i].id === id) {
        user.todos[i].done = true;
      } 
    }

    return response.status(200).json(doesTodoExists);

  } else {

    return response.status(404).json({
      error: "Todo doesn't exists"
    });

  }
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const user = request.user;

  const doesTodoExists = user.todos.find(todo => todo.id === id);

  if (doesTodoExists) {
    for (i = 0; i < user.todos.length; i++) {
      if (user.todos[i].id === id) {
        user.todos.splice(doesTodoExists, 1);
      } 
    }

    return response.status(204).send();

  } else {

    return response.status(404).json({
      error: "Todo doesn't exists"
    });

  }
});

module.exports = app;