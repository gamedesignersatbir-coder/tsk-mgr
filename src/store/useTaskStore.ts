import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export type TaskStatus = 'Pending' | 'In-progress' | 'Done';
export type TaskPriority = 'Low' | 'Medium' | 'High';

export interface Subtask {
    id: string;
    task_id: string;
    title: string;
    is_completed: boolean;
    created_at: string;
}

export interface Task {
    id: string;
    title: string;
    status: TaskStatus;
    priority: TaskPriority;
    created_at: string;
}

interface TaskStore {
    tasks: Task[];
    subtasks: Record<string, Subtask[]>; // Map task_id to subtasks
    loading: boolean;
    generatingSubtasks: Record<string, boolean>; // Map task_id to loading state

    fetchTasks: () => Promise<void>;
    fetchSubtasks: (taskId: string) => Promise<void>;

    addTask: (title: string, priority: TaskPriority) => Promise<void>;
    updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
    deleteTask: (id: string) => Promise<void>;

    generateSubtasks: (taskId: string, taskTitle: string) => Promise<void>;
    toggleSubtask: (subtaskId: string, isCompleted: boolean) => Promise<void>;
}

export const useTaskStore = create<TaskStore>((set) => ({
    tasks: [],
    subtasks: {},
    loading: false,
    generatingSubtasks: {},

    fetchTasks: async () => {
        set({ loading: true });
        const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching tasks:', error);
        } else {
            set({ tasks: data as Task[] });
            // Optionally fetch subtasks for all tasks, but lazy loading is better for perf
        }
        set({ loading: false });
    },

    fetchSubtasks: async (taskId) => {
        const { data, error } = await supabase
            .from('subtasks')
            .select('*')
            .eq('task_id', taskId)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching subtasks:', error);
        } else {
            set((state) => ({
                subtasks: { ...state.subtasks, [taskId]: data as Subtask[] }
            }));
        }
    },

    addTask: async (title, priority) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const newTask = {
            user_id: user.id,
            title,
            priority,
            status: 'Pending' as TaskStatus,
        };

        const tempId = crypto.randomUUID();
        const optimisticTask = { ...newTask, id: tempId, created_at: new Date().toISOString() } as Task;
        set((state) => ({ tasks: [optimisticTask, ...state.tasks] }));

        const { data, error } = await supabase.from('tasks').insert(newTask).select().single();

        if (error) {
            console.error('Error adding task:', error);
            set((state) => ({ tasks: state.tasks.filter(t => t.id !== tempId) }));
        } else if (data) {
            set((state) => ({
                tasks: state.tasks.map(t => t.id === tempId ? (data as Task) : t)
            }));

            // Generate embedding for the new task (fire and forget)
            supabase.functions.invoke('generate-embedding', {
                body: { text: title },
            }).then(async ({ data: embData, error: embError }) => {
                if (embError) {
                    console.error('Error generating embedding:', embError);
                    return;
                }
                if (embData?.embedding) {
                    await supabase
                        .from('tasks')
                        .update({ embedding: embData.embedding })
                        .eq('id', data.id);
                }
            });
        }
    },

    updateTask: async (id, updates) => {
        set((state) => ({
            tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        }));
        await supabase.from('tasks').update(updates).eq('id', id);
    },

    deleteTask: async (id) => {
        set((state) => ({
            tasks: state.tasks.filter((t) => t.id !== id),
            subtasks: Object.fromEntries(Object.entries(state.subtasks).filter(([key]) => key !== id))
        }));
        await supabase.from('tasks').delete().eq('id', id);
    },

    generateSubtasks: async (taskId, taskTitle) => {
        set((state) => ({ generatingSubtasks: { ...state.generatingSubtasks, [taskId]: true } }));

        try {
            const { data, error } = await supabase.functions.invoke('generate-subtasks', {
                body: { taskTitle },
            });

            if (error) throw error;
            if (data?.subtasks) {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                const subtasksToInsert = data.subtasks.map((title: string) => ({
                    task_id: taskId,
                    title,
                    is_completed: false,
                }));

                const { data: insertedData, error: insertError } = await supabase
                    .from('subtasks')
                    .insert(subtasksToInsert)
                    .select();

                if (insertError) throw insertError;

                if (insertedData) {
                    set((state) => ({
                        subtasks: { ...state.subtasks, [taskId]: [...(state.subtasks[taskId] || []), ...(insertedData as Subtask[])] }
                    }));
                }
            }
        } catch (err) {
            console.error('Error generating subtasks:', err);
            alert('Failed to generate subtasks. Please check if your OpenAI API Key is set in Supabase Secrets.');
        } finally {
            set((state) => ({ generatingSubtasks: { ...state.generatingSubtasks, [taskId]: false } }));
        }
    },

    toggleSubtask: async (subtaskId, isCompleted) => {
        // Optimistic Update
        set((state) => {
            const newSubtasks = { ...state.subtasks };
            for (const taskId in newSubtasks) {
                newSubtasks[taskId] = newSubtasks[taskId].map(s =>
                    s.id === subtaskId ? { ...s, is_completed: isCompleted } : s
                );
            }
            return { subtasks: newSubtasks };
        });

        await supabase.from('subtasks').update({ is_completed: isCompleted }).eq('id', subtaskId);
    }
}));
