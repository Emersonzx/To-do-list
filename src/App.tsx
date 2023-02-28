import { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, set } from 'firebase/database';
import { v4 as uuidv4 } from 'uuid';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

const firebaseConfig = {
  apiKey: "AIzaSyCx1--u7hGXa4uxt_BDzzJCwMiM5eb7cv0",
  authDomain: "reactform-74ad1.firebaseapp.com",
  projectId: "reactform-74ad1",
  storageBucket: "reactform-74ad1.appspot.com",
  messagingSenderId: "116229038869",
  appId: "1:116229038869:web:fe8b4a546613f8b8aa7f1c",
  measurementId: "G-70XHRJK8XT"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const TodoList: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodoText, setNewTodoText] = useState('');

  useEffect(() => {
    const todosRef = ref(database, 'todos');

    // fetch data from the database and update the `todos` state accordingly
    onValue(todosRef, (snapshot) => {
      const data = snapshot.val();
      const todoList = data ? Object.values<Todo>(data) : [];
      setTodos(todoList);
    });
  }, [database]);

  const handleNewTodoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewTodoText(event.target.value);
  };

  const handleNewTodoSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const newTodo: Todo = {
      id: uuidv4(), // generate a unique ID for the new todo item
      text: newTodoText.trim(),
      completed: false,
    };
    set(ref(database, `todos/${newTodo.id}`), newTodo);
    setNewTodoText('');
  };

  const handleTodoToggle = (todoId: string) => {
    const todoRef = ref(database, `todos/${todoId}`);
    const todo = todos.find((t) => t.id === todoId);
    if (todo) {
      set(todoRef, { ...todo, completed: !todo.completed });
    }
  };

  const handleTodoDelete = (todoId: string) => {
    const todoRef = ref(database, `todos/${todoId}`);
    set(todoRef, null);
  };
  return (
    <div className="todo-list">
      <h1>Lista de tarefas</h1>
      <p>Planeje sua rotina</p>
      <form  onSubmit={handleNewTodoSubmit}>
        <input className='input' type="text" value={newTodoText} onChange={handleNewTodoChange} />
        <button className='button' type="submit">Adicionar</button>
      </form>
      <ul>
        {todos.map((todo) => (
          <li className="todo-item" key={todo.id}>
            <input className="checkbox"
              type="checkbox"
              checked={todo.completed}
              onChange={() => handleTodoToggle(todo.id)}
            />
            <span className={`todo-text ${todo.completed ? 'completed' : ''}`}>
              {todo.text}
            </span>
            <button className='button' onClick={() => handleTodoDelete(todo.id)}>Remover</button>
          </li>
        ))}
      </ul>
    </div>
  );
  
};

export default TodoList;