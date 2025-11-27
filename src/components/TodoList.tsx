'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Trash2, Plus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface Todo {
    id: number
    title: string
    is_complete: boolean
    created_at: string
}

export default function TodoList() {
    const [todos, setTodos] = useState<Todo[]>([])
    const [newTodo, setNewTodo] = useState('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchTodos()
    }, [])

    const fetchTodos = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('todos')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error
            setTodos(data || [])
        } catch (error) {
            console.error('Error fetching todos:', error)
            toast.error('Failed to load todos')
        } finally {
            setLoading(false)
        }
    }

    const addTodo = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newTodo.trim()) return

        try {
            const { data, error } = await supabase
                .from('todos')
                .insert([{ title: newTodo, is_complete: false }])
                .select()
                .single()

            if (error) throw error

            setTodos([data, ...todos])
            setNewTodo('')
            toast.success('Todo added')
        } catch (error) {
            console.error('Error adding todo:', error)
            toast.error('Failed to add todo')
        }
    }

    const toggleTodo = async (id: number, is_complete: boolean) => {
        try {
            const { error } = await supabase
                .from('todos')
                .update({ is_complete: !is_complete })
                .eq('id', id)

            if (error) throw error

            setTodos(todos.map(todo =>
                todo.id === id ? { ...todo, is_complete: !is_complete } : todo
            ))
        } catch (error) {
            console.error('Error updating todo:', error)
            toast.error('Failed to update todo')
        }
    }

    const deleteTodo = async (id: number) => {
        try {
            const { error } = await supabase
                .from('todos')
                .delete()
                .eq('id', id)

            if (error) throw error

            setTodos(todos.filter(todo => todo.id !== id))
            toast.success('Todo deleted')
        } catch (error) {
            console.error('Error deleting todo:', error)
            toast.error('Failed to delete todo')
        }
    }

    return (
        <div className="w-full max-w-md mx-auto mt-10">
            <Card className="bg-white/80 backdrop-blur-md shadow-xl border-0 ring-1 ring-gray-200 dark:bg-gray-900/80 dark:ring-gray-800">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
                        My Tasks
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={addTodo} className="flex gap-2 mb-6">
                        <Input
                            type="text"
                            placeholder="Add a new task..."
                            value={newTodo}
                            onChange={(e) => setNewTodo(e.target.value)}
                            className="border-gray-200 focus:ring-2 focus:ring-indigo-500 transition-all"
                        />
                        <Button type="submit" disabled={!newTodo.trim()} className="bg-indigo-600 hover:bg-indigo-700 text-white transition-colors">
                            <Plus className="w-4 h-4" />
                        </Button>
                    </form>

                    <ScrollArea className="h-[400px] pr-4">
                        {loading ? (
                            <div className="flex justify-center items-center h-20">
                                <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                            </div>
                        ) : todos.length === 0 ? (
                            <div className="text-center text-gray-500 py-10">
                                No tasks yet. Add one above!
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {todos.map((todo) => (
                                    <div
                                        key={todo.id}
                                        className="group flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-200"
                                    >
                                        <div className="flex items-center gap-3 flex-1">
                                            <Checkbox
                                                checked={todo.is_complete}
                                                onCheckedChange={() => toggleTodo(todo.id, todo.is_complete)}
                                                className="data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                                            />
                                            <span className={`text-sm font-medium transition-all ${todo.is_complete ? 'text-gray-400 line-through decoration-gray-400' : 'text-gray-700 dark:text-gray-200'}`}>
                                                {todo.title}
                                            </span>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => deleteTodo(todo.id)}
                                            className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-600 hover:bg-red-50 transition-all"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    )
}
