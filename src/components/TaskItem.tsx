import { useTaskStore, type Task, type TaskStatus, type TaskPriority } from '../store/useTaskStore';
import { cn } from '../lib/utils';
import { useState, useEffect, useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';

interface TaskItemProps {
    task: Task;
}

// Empty array constant to prevent new reference on each render
const EMPTY_SUBTASKS: never[] = [];

export function TaskItem({ task }: TaskItemProps) {
    const {
        updateTask,
        deleteTask,
        generateSubtasks,
        toggleSubtask,
        fetchSubtasks,
        allSubtasks,
        generatingSubtasks,
    } = useTaskStore(
        useShallow((state) => ({
            updateTask: state.updateTask,
            deleteTask: state.deleteTask,
            generateSubtasks: state.generateSubtasks,
            toggleSubtask: state.toggleSubtask,
            fetchSubtasks: state.fetchSubtasks,
            allSubtasks: state.subtasks,
            generatingSubtasks: state.generatingSubtasks,
        }))
    );

    // Use memoized access to avoid creating new array references
    const subtasks = useMemo(() => allSubtasks[task.id] || EMPTY_SUBTASKS, [allSubtasks, task.id]);
    const isGenerating = generatingSubtasks[task.id];

    const [expanded, setExpanded] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Lazy load subtasks when expanded
    useEffect(() => {
        if (expanded && subtasks.length === 0) {
            fetchSubtasks(task.id);
        }
    }, [expanded, task.id, subtasks.length, fetchSubtasks]);


    const statusColors: Record<TaskStatus, string> = {
        'Pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
        'In-progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
        'Done': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    };

    const priorityColors: Record<TaskPriority, string> = {
        'Low': 'text-slate-500',
        'Medium': 'text-orange-500',
        'High': 'text-red-600 font-bold',
    };

    const handleStatusChange = (e: React.MouseEvent) => {
        e.stopPropagation();
        const nextStatus: Record<TaskStatus, TaskStatus> = {
            'Pending': 'In-progress',
            'In-progress': 'Done',
            'Done': 'Pending',
        };
        updateTask(task.id, { status: nextStatus[task.status] });
    };

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this task?')) {
            setIsDeleting(true);
            await deleteTask(task.id);
        }
    };

    const handleGenerate = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!expanded) setExpanded(true); // Auto expand
        await generateSubtasks(task.id, task.title);
    };

    return (
        <div className={cn(
            "group relative px-4 py-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700 cursor-pointer",
            isDeleting && "opacity-50 pointer-events-none"
        )}
            onClick={() => setExpanded(!expanded)}
        >
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">
                    {/* Status Badge (Clickable) */}
                    <button
                        onClick={handleStatusChange}
                        className={cn(
                            "px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide transition-colors whitespace-nowrap",
                            statusColors[task.status]
                        )}
                    >
                        {task.status}
                    </button>

                    {/* Task Title */}
                    <p className={cn(
                        "text-slate-800 dark:text-slate-200 text-lg font-medium leading-normal font-display flex-1",
                        task.status === 'Done' && "line-through text-slate-400 dark:text-slate-500"
                    )}>
                        {task.title}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {/* AI Generate Button */}
                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className={cn(
                            "p-2 text-purple-500 hover:text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900/20 rounded-full transition-all flex items-center gap-1",
                            isGenerating && "animate-pulse cursor-wait"
                        )}
                        title="Generate AI Subtasks"
                    >
                        <span className="material-symbols-outlined text-xl">
                            {isGenerating ? 'hourglass_top' : 'auto_awesome'}
                        </span>
                        {isGenerating && <span className="text-xs font-bold">AI</span>}
                    </button>

                    {/* Priority Indicator */}
                    <span
                        className={cn("text-xs font-bold uppercase tracking-wider", priorityColors[task.priority])}
                        title={`Priority: ${task.priority}`}
                    >
                        {task.priority}
                    </span>

                    {/* Delete Button (Visible on hover) */}
                    <button
                        onClick={handleDelete}
                        className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-red-500 transition-all rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
                        title="Delete task"
                    >
                        <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                </div>
            </div>

            {/* Subtasks Area */}
            {expanded && (
                <div className="mt-4 pl-4 border-l-2 border-slate-200 dark:border-slate-700 space-y-2 animate-in slide-in-from-top-2 fade-in duration-300">
                    {subtasks.length === 0 && !isGenerating && (
                        <p className="text-sm text-slate-400 italic">No subtasks. Click the sparkles to generate!</p>
                    )}

                    {subtasks.map((sub) => (
                        <div key={sub.id} className="flex items-center gap-3 group/sub" onClick={(e) => e.stopPropagation()}>
                            <button
                                onClick={() => toggleSubtask(sub.id, !sub.is_completed)}
                                className={cn(
                                    "size-5 rounded border flex items-center justify-center transition-colors",
                                    sub.is_completed
                                        ? "bg-primary border-primary text-white"
                                        : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 hover:border-primary"
                                )}
                            >
                                {sub.is_completed && <span className="material-symbols-outlined text-sm font-bold">check</span>}
                            </button>
                            <span className={cn(
                                "text-sm text-slate-700 dark:text-slate-300",
                                sub.is_completed && "line-through text-slate-400"
                            )}>
                                {sub.title}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
