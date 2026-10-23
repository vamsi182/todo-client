import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/authSlice";
import { fetchTodos, addTodo, updateTodo, removeTodo, setFilter, clearTodos } from "../store/todosSlice";

const FILTERS = [
  ["all", "All"],
  ["active", "To do"],
  ["done", "Done"],
];

const fmtDate = (d) => new Date(d).toLocaleDateString(undefined, { day: "numeric", month: "short" });

const isOverdue = (t) =>
  t.dueDate && !t.completed && new Date(t.dueDate) < new Date(new Date().toDateString());

function TodoItem({ todo }) {
  const dispatch = useDispatch();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(todo.title);

  const save = () => {
    const next = title.trim();
    if (next && next !== todo.title) dispatch(updateTodo({ id: todo._id, title: next }));
    else setTitle(todo.title);
    setEditing(false);
  };

  return (
    <li className={`slip ${todo.priority} ${todo.completed ? "is-done" : ""}`}>
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => dispatch(updateTodo({ id: todo._id, completed: !todo.completed }))}
        aria-label={`Mark "${todo.title}" as ${todo.completed ? "not done" : "done"}`}
      />
      <div className="slip-body">
        {editing ? (
          <input
            className="edit"
            value={title}
            autoFocus
            onChange={(e) => setTitle(e.target.value)}
            onBlur={save}
            onKeyDown={(e) => {
              if (e.key === "Enter") save();
              if (e.key === "Escape") {
                setTitle(todo.title);
                setEditing(false);
              }
            }}
          />
        ) : (
          <span className="title" onDoubleClick={() => setEditing(true)}>{todo.title}</span>
        )}
        <span className="meta">
          {todo.priority} priority
          {todo.dueDate && (
            <span className={isOverdue(todo) ? "overdue" : ""}>
              {" · "}due {fmtDate(todo.dueDate)}{isOverdue(todo) ? " (overdue)" : ""}
            </span>
          )}
        </span>
      </div>
      <button className="link" onClick={() => setEditing(true)}>Edit</button>
      <button className="link danger" onClick={() => dispatch(removeTodo(todo._id))}>Delete</button>
    </li>
  );
}

export default function Dashboard() {
  const dispatch = useDispatch();
  const user = useSelector((s) => s.auth.user);
  const { items, filter, loading, error } = useSelector((s) => s.todos);
  const [form, setForm] = useState({ title: "", priority: "medium", dueDate: "" });

  useEffect(() => {
    dispatch(fetchTodos());
  }, [dispatch]);

  const submit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    dispatch(addTodo({ ...form, dueDate: form.dueDate || null }));
    setForm({ title: "", priority: form.priority, dueDate: "" });
  };

  const doneCount = items.filter((t) => t.completed).length;
  const shown = items.filter((t) =>
    filter === "all" ? true : filter === "done" ? t.completed : !t.completed
  );

  return (
    <div className="app">
      <header className="bar">
        <span className="wordmark small">Tally</span>
        <div className="bar-user">
          <span>{user.name}</span>
          <button
            className="btn ghost"
            onClick={() => {
              dispatch(clearTodos());
              dispatch(logout());
            }}
          >
            Log out
          </button>
        </div>
      </header>

      <main className="board">
        <h1>{items.length === 0 ? "Nothing on your list yet" : `${doneCount} of ${items.length} done`}</h1>

        <form className="add" onSubmit={submit}>
          <input
            placeholder="What needs doing?"
            value={form.title}
            maxLength={200}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            aria-label="Task title"
          />
          <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} aria-label="Priority">
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} aria-label="Due date" />
          <button className="btn primary">Add task</button>
        </form>

        <div className="tabs" role="tablist">
          {FILTERS.map(([key, label]) => (
            <button
              key={key}
              role="tab"
              aria-selected={filter === key}
              className={filter === key ? "on" : ""}
              onClick={() => dispatch(setFilter(key))}
            >
              {label}
            </button>
          ))}
        </div>

        {error && <p className="error" role="alert">{error}</p>}
        {loading && <p className="hint">Loading your tasks…</p>}

        <ul className="slips">
          {shown.map((t) => <TodoItem key={t._id} todo={t} />)}
        </ul>

        {!loading && shown.length === 0 && items.length > 0 && (
          <p className="hint">No {filter === "done" ? "finished" : "open"} tasks here.</p>
        )}
        {!loading && items.length === 0 && <p className="hint">Add your first task above to get started.</p>}
        {items.length > 0 && <p className="hint small">Tip: double-click a task title to edit it.</p>}
      </main>
    </div>
  );
}