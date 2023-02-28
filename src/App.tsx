import { useState, useEffect} from 'react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, set } from 'firebase/database';
import { v4 as uuidv4 } from 'uuid';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  userId: string; 
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
    const storedUserId = localStorage.getItem('userId');
    const userId = storedUserId ? storedUserId : uuidv4();
    localStorage.setItem('userId', userId);
  }, []);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    const todosRef = ref(database, `todos/${userId}`);
    
    onValue(todosRef, (snapshot) => {
      const data = snapshot.val();
      const todoList = data ? Object.values<Todo>(data) : [];
      if (todoList.length > 0) {
        setTodos(todoList);
      }
    });
  }, []);

  const handleNewTodoTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewTodoText(event.target.value);
  };

  const handleAddTodo = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newTodoText) {
      return;
    }

    const userId = localStorage.getItem('userId'); 
    const newTodo: Todo = {
      id: uuidv4(), 
      text: newTodoText,
      completed: false,
      userId: userId !== null ? userId : ''
    };
    setTodos((prevTodos) => [...prevTodos, newTodo]);
    setNewTodoText('');

    const todosRef = ref(database, `todos/${userId}`);
    set(todosRef, [...todos, newTodo]); 
  };

  const handleToggleTodoCompleted = (id: string) => {
    const userId = localStorage.getItem('userId'); 
    const updatedTodos = todos.map((todo) => {
      if (todo.id === id) {
        return { ...todo, completed: !todo.completed };
      }
      return todo;
    });
    setTodos(updatedTodos);

    const todosRef = ref(database, `todos/${userId}`);
    set(todosRef, updatedTodos); 
  };

  const handleRemoveTodo = (id: string) => {
    const userId = localStorage.getItem('userId'); 
    const filteredTodos = todos.filter((todo) => todo.id !== id);
    setTodos(filteredTodos);  

    const todosRef = ref(database, `todos/${userId}`);
    set(todosRef, filteredTodos); 
  };
  return (
    <div className="todo-list">
      <h1>Lista de tarefas</h1>
      <p>Planeje sua rotina</p>
      <form onSubmit={handleAddTodo}>
        <input className='input' type="text" value={newTodoText} onChange={handleNewTodoTextChange} />
        <button className='button' type="submit">Adicionar</button>
      </form>
      <ul>
        {todos.map((todo) => (
          <li className="todo-item" key={todo.id}>
            <input className="checkbox"
              type="checkbox"
              checked={todo.completed}
              onChange={() => handleToggleTodoCompleted(todo.id)}
            />
            <span className={`todo-text ${todo.completed ? 'completed' : ''}`}>
              {todo.text}
            </span>
            <button className='button' onClick={() => handleRemoveTodo(todo.id)}>Remover</button>
          </li>
        ))}
      </ul>
    </div>
  );
  
};

export default TodoList;