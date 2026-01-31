import { useState, type KeyboardEvent } from 'react';
import { useTaskStore } from '../store/useTaskStore';

export function TaskInput() {
    const [text, setText] = useState('');
    const addTask = useTaskStore((state) => state.addTask);

    const handleAdd = () => {
        if (text.trim()) {
            addTask(text.trim());
            setText('');
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleAdd();
        }
    };

    return (
        <div className="max-w-[600px] mx-auto w-full">
            <div className="flex flex-col sm:flex-row items-end gap-4">
                <label className="flex flex-col flex-1 w-full">
                    <p className="text-slate-700 dark:text-slate-300 text-sm font-semibold leading-normal pb-2 uppercase tracking-wider">
                        New Task
                    </p>
                    <div className="relative w-full">
                        <input
                            className="form-input flex w-full min-w-0 resize-none overflow-hidden rounded-lg text-slate-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 h-14 placeholder:text-slate-400 p-[15px] text-base font-normal leading-normal transition-all"
                            placeholder="What needs to be done?"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                    </div>
                </label>
                <button
                    onClick={handleAdd}
                    className="flex min-w-[140px] w-full sm:w-auto cursor-pointer items-center justify-center overflow-hidden rounded-lg h-14 px-8 bg-primary text-white text-base font-bold leading-normal tracking-[0.015em] hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95"
                >
                    <span className="truncate">Add Task</span>
                </button>
            </div>
        </div>
    );
}
