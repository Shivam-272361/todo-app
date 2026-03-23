import Navbar from "./components/Navbar";
import Todo from "./components/Todo";

function App() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <Navbar />
      <Todo />
    </div>
  );
}

export default App;
