import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Check, Trash2, Edit2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { toast } from './ui/use-toast';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  category: 'study' | 'coding' | 'general';
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
}

const Todo = () => {
  const [todos, setTodos] = useState<Todo[]>(() => {
    const saved = localStorage.getItem('todos');
    return saved ? JSON.parse(saved) : [];
  });
  const [newTodo, setNewTodo] = useState('');
  const [category, setCategory] = useState<Todo['category']>('general');
  const [priority, setPriority] = useState<Todo['priority']>('medium');
  const [dueDate, setDueDate] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  const addTodo = () => {
    if (!newTodo.trim()) {
      toast({
        title: "Error",
        description: "Please enter a task",
        variant: "destructive"
      });
      return;
    }

    const todo: Todo = {
      id: Date.now().toString(),
      text: newTodo,
      completed: false,
      category,
      priority,
      dueDate: dueDate ? new Date(dueDate) : undefined
    };

    setTodos([...todos, todo]);
    setNewTodo('');
    setDueDate('');

    toast({
      title: "Success",
      description: "Task added successfully!"
    });
  };

  const toggleTodo = (id: string) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id));
    toast({
      title: "Deleted",
      description: "Task removed successfully"
    });
  };

  const startEditing = (todo: Todo) => {
    setEditingId(todo.id);
    setNewTodo(todo.text);
    setCategory(todo.category);
    setPriority(todo.priority);
    setDueDate(todo.dueDate ? todo.dueDate.toISOString().split('T')[0] : '');
  };

  const saveEdit = () => {
    if (!editingId) return;

    setTodos(todos.map(todo =>
      todo.id === editingId
        ? {
            ...todo,
            text: newTodo,
            category,
            priority,
            dueDate: dueDate ? new Date(dueDate) : undefined
          }
        : todo
    ));

    setEditingId(null);
    setNewTodo('');
    setDueDate('');

    toast({
      title: "Updated",
      description: "Task updated successfully"
    });
  };

  const getPriorityColor = (priority: Todo['priority']) => {
    switch (priority) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return '';
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
          Task Manager
        </h2>
        
        <div className="flex flex-col gap-3">
          <Input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="Enter a new task..."
            className="flex-grow"
          />
          
          <div className="flex gap-2 flex-wrap">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Todo['category'])}
              className="px-3 py-2 rounded-md bg-secondary text-foreground"
            >
              <option value="general">General</option>
              <option value="study">Study</option>
              <option value="coding">Coding</option>
            </select>
            
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Todo['priority'])}
              className="px-3 py-2 rounded-md bg-secondary text-foreground"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
            
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-auto"
            />
            
            <Button
              onClick={editingId ? saveEdit : addTodo}
              className="btn-hover"
            >
              {editingId ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Save
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Task
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {todos.map((todo) => (
          <motion.div
            key={todo.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className={`flex items-center justify-between p-4 mb-2 rounded-lg ${
              todo.completed ? 'bg-secondary/50' : 'glass'
            }`}
          >
            <div className="flex items-center gap-3 flex-grow">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleTodo(todo.id)}
                className={`${todo.completed ? 'text-primary' : ''}`}
              >
                <Check className={`w-4 h-4 ${todo.completed ? 'opacity-100' : 'opacity-30'}`} />
              </Button>
              
              <div className="flex-grow">
                <p className={`${todo.completed ? 'line-through text-muted-foreground' : ''}`}>
                  {todo.text}
                </p>
                <div className="flex gap-2 text-xs text-muted-foreground mt-1">
                  <span className="bg-secondary px-2 py-0.5 rounded">
                    {todo.category}
                  </span>
                  <span className={`px-2 py-0.5 rounded ${getPriorityColor(todo.priority)}`}>
                    {todo.priority}
                  </span>
                  {todo.dueDate && (
                    <span className="bg-secondary px-2 py-0.5 rounded">
                      Due: {new Date(todo.dueDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => startEditing(todo)}
              >
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteTodo(todo.id)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {todos.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-muted-foreground p-8"
        >
          No tasks yet. Add one to get started!
        </motion.div>
      )}
    </div>
  );
};

export default Todo; 