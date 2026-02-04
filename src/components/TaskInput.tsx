import { useState, type KeyboardEvent } from 'react';
import { useTaskStore, type TaskPriority } from '../store/useTaskStore';

export function TaskInput() {
    const [title, setTitle] = useState('');
    const [priority, setPriority] = useState<TaskPriority>('Medium');
    const addTask = useTaskStore((state) => state.addTask);

    const handleAdd = () => {
        if (title.trim()) {
            addTask(title.trim(), priority);
            setTitle('');
            setPriority('Medium'); // Reset to default
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleAdd();
        }
    };

    return (
        <div className="max-w-[600px] mx-auto w-full">
            <div className="flex flex-col sm:flex-row items-end gap-3">
                <div className="flex-1 w-full space-y-2">
                    <p className="text-slate-700 dark:text-slate-300 text-sm font-semibold leading-normal uppercase tracking-wider">
                        New Task
                    </p>
                    <div className="flex gap-2">
                        <input
                            className="form-input flex-1 min-w-0 resize-none overflow-hidden rounded-lg text-slate-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 h-12 placeholder:text-slate-400 px-4 text-base font-normal transition-all"
                            placeholder="What needs to be done?"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />

                        <select
                            value={priority}
                            onChange={(e) => setPriority(e.target.value as TaskPriority)}
                            className="h-12 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-3 text-sm focus:ring-2 focus:ring-primary/50 outline-none cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                        >
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                        </select>
                    </div>
                </div>

                <button
                    onClick={handleAdd}
                    className="h-12 w-full sm:w-auto px-6 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary/90 transition-all active:scale-95 flex items-center justify-center shrink-0"
                >
                    Add Task
                </button>
            </div>
        </div>
    );
}
