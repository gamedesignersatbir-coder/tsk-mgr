import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Task {
    id: string;
    text: string;
    completed: boolean;
}

interface TaskStore {
    tasks: Task[];
    addTask: (text: string) => void;
    toggleTask: (id: string) => void;
    deleteTask: (id: string) => void;
}

export const useTaskStore = create<TaskStore>()(
    persist(
        (set) => ({
            tasks: [
                { id: '1', text: 'Finish homework', completed: false },
                { id: '2', text: 'Call John', completed: false },
                { id: '3', text: 'Buy groceries', completed: true },
            ],
            addTask: (text) => set((state) => ({
                tasks: [...state.tasks, { id: crypto.randomUUID(), text, completed: false }]
            })),
            toggleTask: (id) => set((state) => ({
                tasks: state.tasks.map((t) => t.id === id ? { ...t, completed: !t.completed } : t)
            })),
            deleteTask: (id) => set((state) => ({
                tasks: state.tasks.filter((t) => t.id !== id)
            })),
        }),
        {
            name: 'task-storage',
        }
    )
);
