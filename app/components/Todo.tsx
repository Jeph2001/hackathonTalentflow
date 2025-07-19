import { useState } from "react";

type TaskItem = {
  id: string;
  content: string;
};

type Column = {
  name: string;
  items: TaskItem[];
};

type Columns = {
  [key: string]: Column;
};

type DraggedItem = {
  columnId: string;
  item: TaskItem;
} | null;

function Todo() {
  const [columns, setColumns] = useState<Columns>({
    todo: {
      name: "To Do",
      items: [
        { id: "1", content: "Market research" },
        { id: "2", content: "Write Projects" },
      ],
    },
    doing: {
      name: "Doing",
      items: [{ id: "3", content: "Design UI mockups" }],
    },
    done: {
      name: "Done",
      items: [{ id: "4", content: "Set up repository" }],
    },
  });

  const [newTask, setNewTask] = useState<string>("");
  const [activeColumns, setActiveColumn] = useState<string>("todo");
  const [draggedItem, setDraggedItem] = useState<DraggedItem>(null);

  const addNewTask = (): void => {
    if (newTask.trim() === "") return;

    const updatedColumns = { ...columns };

    updatedColumns[activeColumns].items.push({
      id: Date.now().toString(),
      content: newTask,
    });

    setColumns(updatedColumns);
    setNewTask("");
  };

  const removeTask = (columnId: string, taskId: string): void => {
    const updatedColumns = { ...columns };

    updatedColumns[columnId].items = updatedColumns[columnId].items.filter(
      (item) => item.id !== taskId
    );

    setColumns(updatedColumns);
  };

  const handleDragStart = (columnId: string, item: TaskItem): void => {
    setDraggedItem({ columnId, item });
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
  };

  const handleDrop = (
    e: React.DragEvent<HTMLDivElement>,
    columnId: string
  ): void => {
    e.preventDefault();

    if (!draggedItem) return;

    const { columnId: sourceColumnId, item } = draggedItem;

    if (sourceColumnId === columnId) return;

    const updatedColumns = { ...columns };

    updatedColumns[sourceColumnId].items = updatedColumns[
      sourceColumnId
    ].items.filter((i) => i.id !== item.id);

    updatedColumns[columnId].items.push(item);

    setColumns(updatedColumns);
    setDraggedItem(null);
  };

  const columnStyles: Record<string, { header: string; border: string }> = {
    todo: {
      header: "bg-gray-200",
      border: "border-gray-200",
    },
    doing: {
      header: "bg-cyan-200",
      border: "border-cyan-200",
    },
    done: {
      header: "bg-green-200",
      border: "border-green-200",
    },
  };

  return (
    <div className="p-6 w-full min-h-screen flex items-center justify-center">
      <div className="flex items-center justify-center flex-col gap-4 w-full max-w-6xl">
        <div className="mb-8 flex w-full max-w-lg shadow-lg rounded-lg overflow-hidden">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Add a new task..."
            className="flex-grow p-3 bg-zinc-700 text-white"
            onKeyDown={(e) => e.key === "Enter" && addNewTask()}
          />

          <select
            value={activeColumns}
            onChange={(e) => setActiveColumn(e.target.value)}
            className="p-3 bg-zinc-700 text-white border-0 border-l border-zinc-600"
          >
            {Object.keys(columns).map((columnId) => (
              <option value={columnId} key={columnId}>
                {columns[columnId].name}
              </option>
            ))}
          </select>

          <button
            onClick={addNewTask}
            className="px-6 border rounded-r-2xl text-black cursor-pointer"
          >
            Add
          </button>
        </div>

        <div className="flex gap-6 overflow-x-auto pb-6 w-full">
          {Object.keys(columns).map((columnId) => (
            <div
              key={columnId}
              className={`flex-shrink-0 w-80 bg-white rounded-lg shadow-xl border-t-4 ${columnStyles[columnId]?.border}`}
              onDragOver={(e) => handleDragOver(e)}
              onDrop={(e) => handleDrop(e, columnId)}
            >
              <div
                className={`p-4 text-white font-bold text-xl rounded-t-md ${columnStyles[columnId]?.header}`}
              >
                {columns[columnId].name}
                <span className="ml-2 px-2 py-1 bg-zinc-800 bg-opacity-30 rounded-full text-sm">
                  {columns[columnId].items.length}
                </span>
              </div>

              <div className="p-3 min-h-64">
                {columns[columnId].items.length === 0 ? (
                  <div className="text-center py-10 text-zinc-500 italic text-sm">
                    Drop tasks here
                  </div>
                ) : (
                  columns[columnId].items.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 mb-3 bg-gray-100 text-black rounded-lg shadow-md cursor-move flex items-center justify-between transform transition-all duration-200 hover:scale-105 hover:shadow-lg"
                      draggable
                      onDragStart={() => handleDragStart(columnId, item)}
                    >
                      <span className="mr-2">{item.content}</span>
                      <button
                        onClick={() => removeTask(columnId, item.id)}
                        className="text-zinc-400 hover:text-red-400 transition-colors duration-200 w-6 h-6 flex items-center justify-center rounded-full hover:bg-zinc-600"
                      >
                        <span className="text-lg cursor-pointer">x</span>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Todo;
