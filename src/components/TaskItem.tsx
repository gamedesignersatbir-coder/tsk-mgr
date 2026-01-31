import { useTaskStore, type Task } from '../store/useTaskStore';
import { cn } from '../lib/utils';

interface TaskItemProps {
    task: Task;
}

export function TaskItem({ task }: TaskItemProps) {
    const toggleTask = useTaskStore((state) => state.toggleTask);

    return (
        <div className="group px-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <label className="flex items-center gap-x-4 py-4 cursor-pointer">
                <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTask(task.id)}
                    className="task-checkbox h-6 w-6 rounded border-slate-300 dark:border-slate-600 border-2 bg-transparent text-primary checked:bg-primary checked:border-primary focus:ring-0 focus:ring-offset-0 transition-all cursor-pointer"
                />
                <p className={cn(
                    "text-slate-800 dark:text-slate-200 text-lg font-medium leading-normal font-display",
                    task.completed && "line-through text-slate-400"
                )}>
                    {task.text}
                </p>
            </label>
        </div>
    );
}
