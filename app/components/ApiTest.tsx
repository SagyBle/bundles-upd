import React, { useEffect, useState } from "react";
import dummyJsonApi from "app/services/dummyTest.service";

const ApiTest = () => {
  const [todos, setTodos] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const data = await dummyJsonApi.get<{ todos: any[] }>("/todos");
        setTodos(data.todos);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTodos();
  }, []);

  return (
    <div>
      <h2>API Test (Using ApiService)</h2>

      {loading && <p>Loading todos...</p>}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}

      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>
            <strong>{todo.todo}</strong> -{" "}
            {todo.completed ? "✅ Done" : "❌ Not Done"}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ApiTest;
