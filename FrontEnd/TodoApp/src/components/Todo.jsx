import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Check,
  CircleDashed,
  PencilLine,
  Plus,
  Search,
  Target,
  Trash2,
  X,
} from "lucide-react";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api/v1`,
});

const initialForm = {
  title: "",
  description: "",
  priority: "mid",
  dueDate: "",
  completed: false,
};

const priorityTheme = {
  low: "bg-emerald-400/15 text-emerald-200 border-emerald-300/20",
  mid: "bg-amber-400/15 text-amber-100 border-amber-300/20",
  high: "bg-rose-400/15 text-rose-100 border-rose-300/20",
};

const priorityCopy = {
  low: "Low",
  mid: "Medium",
  high: "High",
};

const formatDate = (value) => {
  if (!value) {
    return "No deadline";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
};

const getInputDate = (value) => {
  if (!value) {
    return "";
  }

  return new Date(value).toISOString().split("T")[0];
};

const Todo = () => {
  const [todos, setTodos] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState("");
  const [activeTodoId, setActiveTodoId] = useState("");
  const [activeTodo, setActiveTodo] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadTodos = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/getTodo");
      const items = response.data.data ?? [];
      setTodos(items);
      setError("");

      if (!activeTodoId && items.length > 0) {
        setActiveTodoId(items[0]._id);
      }
    } catch (requestError) {
      setError("Couldn't load your todos. Check that the backend URL is configured and the service is live.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTodos();
  }, []);

  useEffect(() => {
    const loadTodoById = async () => {
      if (!activeTodoId) {
        setActiveTodo(null);
        return;
      }

      try {
        const response = await api.get(`/getById/${activeTodoId}`);
        setActiveTodo(response.data.data ?? null);
      } catch (requestError) {
        setActiveTodo(null);
      }
    };

    loadTodoById();
  }, [activeTodoId, todos]);

  const filteredTodos = useMemo(() => {
    return todos.filter((todo) => {
      const matchesSearch = [todo.title, todo.description]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(search.toLowerCase()));

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "done" && todo.completed) ||
        (statusFilter === "open" && !todo.completed);

      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter, todos]);

  const stats = useMemo(() => {
    const completed = todos.filter((todo) => todo.completed).length;
    const dueSoon = todos.filter((todo) => {
      if (!todo.dueDate || todo.completed) {
        return false;
      }

      const dueTime = new Date(todo.dueDate).getTime();
      const now = Date.now();
      const threeDays = 1000 * 60 * 60 * 24 * 3;

      return dueTime >= now && dueTime - now <= threeDays;
    }).length;

    return {
      total: todos.length,
      completed,
      open: todos.length - completed,
      dueSoon,
    };
  }, [todos]);

  const progress = stats.total ? Math.round((stats.completed / stats.total) * 100) : 0;

  const resetForm = () => {
    setForm(initialForm);
    setEditingId("");
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.title.trim()) {
      setError("A title is required.");
      return;
    }

    const payload = {
      ...form,
      title: form.title.trim(),
      description: form.description.trim(),
      dueDate: form.dueDate || null,
    };

    try {
      setIsSubmitting(true);
      setError("");

      if (editingId) {
        const response = await api.put(`/update/${editingId}`, payload);
        const updatedTodo = response.data.data;
        setTodos((current) =>
          current.map((todo) => (todo._id === editingId ? updatedTodo : todo)),
        );
        setActiveTodoId(updatedTodo._id);
      } else {
        const response = await api.post("/create", payload);
        const createdTodo = response.data.data;
        setTodos((current) => [createdTodo, ...current]);
        setActiveTodoId(createdTodo._id);
      }

      resetForm();
    } catch (requestError) {
      setError("The todo couldn't be saved.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/delete/${id}`);
      const remainingTodos = todos.filter((todo) => todo._id !== id);
      setTodos(remainingTodos);

      if (editingId === id) {
        resetForm();
      }

      if (activeTodoId === id) {
        setActiveTodoId(remainingTodos[0]?._id ?? "");
      }
    } catch (requestError) {
      setError("The todo couldn't be deleted.");
    }
  };

  const handleToggle = async (todo) => {
    try {
      const response = await api.put(`/update/${todo._id}`, {
        completed: !todo.completed,
      });

      const updatedTodo = response.data.data;
      setTodos((current) =>
        current.map((item) => (item._id === todo._id ? updatedTodo : item)),
      );

      if (activeTodoId === todo._id) {
        setActiveTodo(updatedTodo);
      }
    } catch (requestError) {
      setError("The completion state couldn't be updated.");
    }
  };

  const handleEdit = (todo) => {
    setEditingId(todo._id);
    setActiveTodoId(todo._id);
    setForm({
      title: todo.title ?? "",
      description: todo.description ?? "",
      priority: todo.priority ?? "mid",
      dueDate: getInputDate(todo.dueDate),
      completed: Boolean(todo.completed),
    });
  };

  return (
    <main className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-[-10%] top-10 h-72 w-72 rounded-full bg-[var(--accent)]/20 blur-3xl" />
        <div className="absolute right-[-6%] top-40 h-80 w-80 rounded-full bg-[var(--accent-soft)]/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
      </div>

      <section className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-10 lg:px-10 lg:py-14">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[2rem] border border-white/10 bg-white/6 p-7 shadow-[0_25px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl lg:p-8">
            <p className="mb-3 text-sm uppercase tracking-[0.35em] text-[var(--accent-soft)]">
              Daily command center
            </p>
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <h2 className="text-4xl font-semibold leading-tight text-white lg:text-5xl">
                  Build a calm system for chaotic work.
                </h2>
                <p className="mt-4 max-w-xl text-base leading-7 text-white/65">
                  Track deadlines, clean up tasks quickly, and keep the important
                  work visible without turning your app into a wall of boxes.
                </p>
              </div>

              <div className="min-w-56 rounded-[1.5rem] border border-white/10 bg-[color:rgba(255,255,255,0.06)] p-5">
                <div className="mb-3 flex items-center justify-between text-sm text-white/60">
                  <span>Completed</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-white/8">
                  <div
                    className="h-full rounded-full bg-[linear-gradient(90deg,var(--accent),var(--accent-soft))] transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
            {[
              { label: "Total tasks", value: stats.total, icon: Target },
              { label: "Open now", value: stats.open, icon: CircleDashed },
              { label: "Done", value: stats.completed, icon: Check },
              { label: "Due soon", value: stats.dueSoon, icon: CalendarDays },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-[1.75rem] border border-white/10 bg-[color:rgba(255,255,255,0.06)] p-5 backdrop-blur-xl"
              >
                <item.icon className="mb-6 h-5 w-5 text-[var(--accent-soft)]" />
                <p className="text-3xl font-semibold text-white">{item.value}</p>
                <p className="mt-2 text-sm text-white/55">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr]">
          <section className="rounded-[2rem] border border-white/10 bg-[color:rgba(9,12,24,0.84)] p-6 shadow-[0_25px_80px_rgba(0,0,0,0.28)]">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-white/40">
                  Composer
                </p>
                <h3 className="mt-2 text-2xl font-semibold text-white">
                  {editingId ? "Refine the task" : "Create a fresh task"}
                </h3>
              </div>
              {editingId ? (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/70 transition hover:border-white/25 hover:text-white"
                >
                  Cancel edit
                </button>
              ) : null}
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <label className="block">
                <span className="mb-2 block text-sm text-white/55">Title</span>
                <input
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-white/25 focus:border-[var(--accent)]/60"
                  type="text"
                  name="title"
                  placeholder="Ship landing page copy"
                  value={form.title}
                  onChange={handleChange}
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm text-white/55">Description</span>
                <textarea
                  className="min-h-32 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-white/25 focus:border-[var(--accent)]/60"
                  name="description"
                  placeholder="What matters, what is blocked, and what done should look like."
                  value={form.description}
                  onChange={handleChange}
                />
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm text-white/55">Priority</span>
                  <select
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-[var(--accent)]/60"
                    name="priority"
                    value={form.priority}
                    onChange={handleChange}
                  >
                    <option className="bg-slate-900" value="low">
                      Low
                    </option>
                    <option className="bg-slate-900" value="mid">
                      Medium
                    </option>
                    <option className="bg-slate-900" value="high">
                      High
                    </option>
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm text-white/55">Due date</span>
                  <input
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-[var(--accent)]/60"
                    type="date"
                    name="dueDate"
                    value={form.dueDate}
                    onChange={handleChange}
                  />
                </label>
              </div>

              <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/4 px-4 py-3 text-sm text-white/75">
                <input
                  className="h-4 w-4 accent-[var(--accent)]"
                  type="checkbox"
                  name="completed"
                  checked={form.completed}
                  onChange={handleChange}
                />
                Mark as completed immediately
              </label>

              {error ? (
                <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                  {error}
                </div>
              ) : null}

              <button
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,var(--accent),var(--accent-soft))] px-5 py-3 font-medium text-slate-950 transition hover:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
                type="submit"
                disabled={isSubmitting}
              >
                {editingId ? <PencilLine className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                {isSubmitting ? "Saving..." : editingId ? "Update task" : "Create task"}
              </button>
            </form>
          </section>

          <section className="space-y-5">
            <div className="rounded-[2rem] border border-white/10 bg-[color:rgba(9,12,24,0.84)] p-6 shadow-[0_25px_80px_rgba(0,0,0,0.28)]">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-white/40">
                    Task list
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold text-white">
                    Everything in motion
                  </h3>
                </div>

                <div className="flex flex-col gap-3 md:flex-row">
                  <label className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white/60">
                    <Search className="h-4 w-4" />
                    <input
                      className="bg-transparent outline-none placeholder:text-white/30"
                      type="text"
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search tasks"
                    />
                  </label>

                  <div className="flex rounded-full border border-white/10 bg-white/5 p-1 text-sm text-white/65">
                    {[
                      { id: "all", label: "All" },
                      { id: "open", label: "Open" },
                      { id: "done", label: "Done" },
                    ].map((filter) => (
                      <button
                        key={filter.id}
                        type="button"
                        onClick={() => setStatusFilter(filter.id)}
                        className={`rounded-full px-4 py-2 transition ${
                          statusFilter === filter.id
                            ? "bg-white text-slate-950"
                            : "hover:text-white"
                        }`}
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-5 xl:grid-cols-[1fr_0.78fr]">
              <div className="space-y-4">
                {isLoading ? (
                  <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 text-center text-white/60">
                    Loading your workspace...
                  </div>
                ) : null}

                {!isLoading && filteredTodos.length === 0 ? (
                  <div className="rounded-[2rem] border border-dashed border-white/15 bg-white/5 p-8 text-center">
                    <p className="text-lg font-medium text-white">No tasks match this view.</p>
                    <p className="mt-2 text-sm text-white/50">
                      Try another filter, or create a new task from the composer.
                    </p>
                  </div>
                ) : null}

                {filteredTodos.map((todo) => (
                  <article
                    key={todo._id}
                    className={`rounded-[1.75rem] border p-5 transition ${
                      activeTodoId === todo._id
                        ? "border-[var(--accent)]/45 bg-[color:rgba(255,255,255,0.09)] shadow-[0_20px_60px_rgba(0,0,0,0.22)]"
                        : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/7"
                    }`}
                  >
                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => handleToggle(todo)}
                        className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition ${
                          todo.completed
                            ? "border-emerald-300/30 bg-emerald-300/20 text-emerald-100"
                            : "border-white/20 text-white/35 hover:border-white/40 hover:text-white/60"
                        }`}
                      >
                        <Check className="h-4 w-4" />
                      </button>

                      <div
                        className="min-w-0 flex-1 cursor-pointer"
                        onClick={() => setActiveTodoId(todo._id)}
                      >
                        <div className="flex flex-wrap items-center gap-3">
                          <h4
                            className={`text-lg font-medium ${
                              todo.completed ? "text-white/45 line-through" : "text-white"
                            }`}
                          >
                            {todo.title}
                          </h4>
                          <span
                            className={`rounded-full border px-3 py-1 text-xs font-medium ${
                              priorityTheme[todo.priority] ?? priorityTheme.mid
                            }`}
                          >
                            {priorityCopy[todo.priority] ?? "Medium"}
                          </span>
                        </div>

                        <p className="mt-3 line-clamp-2 text-sm leading-6 text-white/55">
                          {todo.description || "No description added yet."}
                        </p>

                        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.2em] text-white/35">
                          <span>{todo.completed ? "Completed" : "In progress"}</span>
                          <span>{formatDate(todo.dueDate)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 flex gap-3">
                      <button
                        type="button"
                        onClick={() => handleEdit(todo)}
                        className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-white/70 transition hover:border-white/25 hover:text-white"
                      >
                        <PencilLine className="h-4 w-4" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(todo._id)}
                        className="inline-flex items-center gap-2 rounded-full border border-rose-300/15 px-4 py-2 text-sm text-rose-100/80 transition hover:border-rose-300/35 hover:bg-rose-400/8"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </article>
                ))}
              </div>

              <aside className="rounded-[2rem] border border-white/10 bg-[color:rgba(9,12,24,0.84)] p-6 shadow-[0_25px_80px_rgba(0,0,0,0.28)]">
                <p className="text-xs uppercase tracking-[0.35em] text-white/40">
                  Focus panel
                </p>
                <h3 className="mt-2 text-2xl font-semibold text-white">
                  Task detail
                </h3>

                {activeTodo ? (
                  <div className="mt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${
                            priorityTheme[activeTodo.priority] ?? priorityTheme.mid
                          }`}
                        >
                          {priorityCopy[activeTodo.priority] ?? "Medium"} priority
                        </span>
                        <h4 className="mt-4 text-3xl font-semibold leading-tight text-white">
                          {activeTodo.title}
                        </h4>
                      </div>

                      <button
                        type="button"
                        onClick={() => setActiveTodoId("")}
                        className="rounded-full border border-white/10 p-2 text-white/50 transition hover:border-white/25 hover:text-white"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-6 space-y-5">
                      <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                        <p className="text-xs uppercase tracking-[0.25em] text-white/35">
                          Status
                        </p>
                        <p className="mt-2 text-base text-white/80">
                          {activeTodo.completed ? "Completed and off your plate." : "Still active and waiting for attention."}
                        </p>
                      </div>

                      <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                        <p className="text-xs uppercase tracking-[0.25em] text-white/35">
                          Deadline
                        </p>
                        <p className="mt-2 text-base text-white/80">
                          {formatDate(activeTodo.dueDate)}
                        </p>
                      </div>

                      <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                        <p className="text-xs uppercase tracking-[0.25em] text-white/35">
                          Description
                        </p>
                        <p className="mt-2 whitespace-pre-wrap text-base leading-7 text-white/72">
                          {activeTodo.description || "No extra notes yet. Add some context to make the next step obvious."}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-8 rounded-[1.75rem] border border-dashed border-white/15 bg-white/4 p-8 text-center">
                    <p className="text-lg font-medium text-white">
                      Select a task to inspect it.
                    </p>
                    <p className="mt-2 text-sm text-white/45">
                      This panel uses your `getTodoById` endpoint to pull the latest task detail.
                    </p>
                  </div>
                )}
              </aside>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
};

export default Todo;
