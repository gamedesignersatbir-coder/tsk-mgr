import { useTaskStore } from '../store/useTaskStore';
import { TaskItem } from './TaskItem';
import { TaskInput } from './TaskInput';

export function TaskDashboard() {
    const tasks = useTaskStore((state) => state.tasks);

    return (
        <main className="bg-white dark:bg-slate-900 shadow-sm border-x border-b border-slate-200 dark:border-slate-800 rounded-b-xl flex flex-col p-8 md:p-12 mb-10">
            {/* Headline */}
            <div className="mb-10">
                <h1 className="text-slate-900 dark:text-white tracking-tight text-[40px] font-bold leading-tight text-center font-display">
                    Your Tasks
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-center mt-2">
                    Manage your daily activities and goals
                </p>
            </div>

            {/* Tasks Checklist Area */}
            <div className="max-w-[600px] mx-auto w-full space-y-2 mb-12">
                {tasks.map((task) => (
                    <TaskItem key={task.id} task={task} />
                ))}
                {tasks.length === 0 && (
                    <p className="text-center text-slate-400 py-8">No tasks yet. Add one below!</p>
                )}
            </div>

            {/* New Task Input Form */}
            <TaskInput />

            {/* Generous Spacing before Logout */}
            <div className="mt-32 border-t border-slate-100 dark:border-slate-800 pt-8 flex justify-center">
                <button className="flex items-center gap-2 text-slate-400 hover:text-red-500 font-medium transition-colors py-2 px-4 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10">
                    <span className="material-symbols-outlined text-xl">logout</span>
                    <span>Logout</span>
                </button>
            </div>
        </main>
    );
}
