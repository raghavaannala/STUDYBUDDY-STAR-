import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Clock, Edit, Plus, Trash2, Calendar, Tag } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'todo' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  tags: string[];
  progress: number;
  createdAt: string;
}

interface Interest {
  id: string;
  label: string;
}

// Mock data for tasks
const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Complete Python Data Structures Assignment',
    description: 'Implement linked list, stack, and queue with proper testing',
    category: 'programming',
    status: 'in-progress',
    priority: 'high',
    dueDate: '2023-12-15',
    tags: ['Python', 'Data Structures', 'Assignment'],
    progress: 65,
    createdAt: '2023-12-01'
  },
  {
    id: '2',
    title: 'Study React Hooks',
    description: 'Learn useEffect, useContext, and custom hooks for next project',
    category: 'programming',
    status: 'todo',
    priority: 'medium',
    dueDate: '2023-12-20',
    tags: ['React', 'JavaScript', 'Frontend'],
    progress: 0,
    createdAt: '2023-12-03'
  },
  {
    id: '3',
    title: 'Database Design Project',
    description: 'Create ERD and implement schema for e-commerce application',
    category: 'programming',
    status: 'completed',
    priority: 'high',
    dueDate: '2023-12-05',
    tags: ['SQL', 'Database', 'Project'],
    progress: 100,
    createdAt: '2023-11-20'
  },
  {
    id: '4',
    title: 'Complete Calculus Integration Problems',
    description: 'Solve problems 1-15 from Chapter 7',
    category: 'math',
    status: 'in-progress',
    priority: 'medium',
    dueDate: '2023-12-18',
    tags: ['Calculus', 'Integration', 'Homework'],
    progress: 40,
    createdAt: '2023-12-05'
  },
  {
    id: '5',
    title: 'Study Linear Algebra Proofs',
    description: 'Review vector space theorems and eigenvalue properties',
    category: 'math',
    status: 'todo',
    priority: 'low',
    dueDate: '2023-12-25',
    tags: ['Linear Algebra', 'Proofs', 'Exam Prep'],
    progress: 0,
    createdAt: '2023-12-07'
  },
  {
    id: '6',
    title: 'Physics Lab Report',
    description: 'Write up results from the pendulum experiment',
    category: 'science',
    status: 'in-progress',
    priority: 'high',
    dueDate: '2023-12-14',
    tags: ['Physics', 'Lab', 'Mechanics'],
    progress: 75,
    createdAt: '2023-12-02'
  },
  {
    id: '7',
    title: 'Chemistry Exam Study Guide',
    description: 'Create comprehensive notes for organic chemistry final',
    category: 'science',
    status: 'todo',
    priority: 'high',
    dueDate: '2023-12-22',
    tags: ['Chemistry', 'Organic', 'Exam Prep'],
    progress: 0,
    createdAt: '2023-12-08'
  },
  {
    id: '8',
    title: 'Spanish Conversation Practice',
    description: 'Complete dialog exercises and record for feedback',
    category: 'language',
    status: 'in-progress',
    priority: 'medium',
    dueDate: '2023-12-16',
    tags: ['Spanish', 'Speaking', 'Practice'],
    progress: 30,
    createdAt: '2023-12-04'
  },
  {
    id: '9',
    title: 'English Literature Essay',
    description: 'Write 1500 word analysis of modern poetry themes',
    category: 'language',
    status: 'todo',
    priority: 'medium',
    dueDate: '2023-12-19',
    tags: ['English', 'Essay', 'Literature'],
    progress: 0,
    createdAt: '2023-12-06'
  },
  {
    id: '10',
    title: 'Research AI Ethics Paper',
    description: 'Gather sources and outline paper on AI bias in algorithms',
    category: 'other',
    status: 'in-progress',
    priority: 'medium',
    dueDate: '2023-12-28',
    tags: ['AI', 'Ethics', 'Research'],
    progress: 25,
    createdAt: '2023-12-09'
  }
];

const TaskGroups = ({ interest }: { interest: Interest }) => {
  const [activeTab, setActiveTab] = useState<string>('todo');
  const [showNewTaskDialog, setShowNewTaskDialog] = useState<boolean>(false);
  
  // Filter tasks by the current interest category
  const filteredTasks = mockTasks.filter(task => task.category === interest.id);
  
  // Group tasks by status
  const todoTasks = filteredTasks.filter(task => task.status === 'todo');
  const inProgressTasks = filteredTasks.filter(task => task.status === 'in-progress');
  const completedTasks = filteredTasks.filter(task => task.status === 'completed');
  
  const handleNewTask = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real implementation, this would add a new task
    setShowNewTaskDialog(false);
  };
  
  if (filteredTasks.length === 0) {
    return null; // Don't render this section if there are no tasks for this interest
  }
  
  return (
    <div className="mb-10">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">{interest.label} Tasks</h3>
        <Dialog open={showNewTaskDialog} onOpenChange={setShowNewTaskDialog}>
          <DialogTrigger asChild>
            <Button size="sm" variant="default" className="flex items-center gap-1 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600">
              <Plus className="h-4 w-4" />
              <span>New Task</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
              <DialogDescription>
                Add a new task to track your learning progress.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleNewTask}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" placeholder="Task title" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" placeholder="Task description" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="priority">Priority</Label>
                    <select id="priority" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input id="dueDate" type="date" />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="tags">Tags (comma separated)</Label>
                  <Input id="tags" placeholder="e.g. Python, Homework, Project" />
          </div>
        </div>
              <DialogFooter>
                <Button type="submit">Create Task</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue="todo" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="todo" className="flex gap-2 items-center">
            To Do
            {todoTasks.length > 0 && (
              <Badge variant="secondary" className="ml-1 bg-primary/20">{todoTasks.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="in-progress" className="flex gap-2 items-center">
            In Progress
            {inProgressTasks.length > 0 && (
              <Badge variant="secondary" className="ml-1 bg-amber-500/20 text-amber-400">{inProgressTasks.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex gap-2 items-center">
            Completed
            {completedTasks.length > 0 && (
              <Badge variant="secondary" className="ml-1 bg-green-500/20 text-green-400">{completedTasks.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="todo">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {todoTasks.length > 0 ? (
              todoTasks.map(task => (
                <TaskCard key={task.id} task={task} />
              ))
            ) : (
              <div className="col-span-full text-center py-12 bg-gradient-to-br from-gray-900/50 to-gray-800/50 rounded-lg border border-gray-800">
                <div className="flex flex-col items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <CheckCircle2 className="h-8 w-8 text-primary/70" />
                  </div>
                  <h4 className="text-lg font-medium mb-2">No Tasks</h4>
                  <p className="text-muted-foreground text-sm max-w-xs mx-auto mb-4">
                    You have no pending tasks in this category. Add a new task to get started.
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowNewTaskDialog(true)}
                    className="text-xs"
                  >
                    <Plus className="h-3 w-3 mr-1" /> Add Task
                  </Button>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="in-progress">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {inProgressTasks.length > 0 ? (
              inProgressTasks.map(task => (
                <TaskCard key={task.id} task={task} />
              ))
            ) : (
              <div className="col-span-full text-center py-12 bg-gradient-to-br from-gray-900/50 to-gray-800/50 rounded-lg border border-gray-800">
                <p className="text-muted-foreground">No tasks in progress</p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="completed">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {completedTasks.length > 0 ? (
              completedTasks.map(task => (
                <TaskCard key={task.id} task={task} />
            ))
          ) : (
              <div className="col-span-full text-center py-12 bg-gradient-to-br from-gray-900/50 to-gray-800/50 rounded-lg border border-gray-800">
                <p className="text-muted-foreground">No completed tasks</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const TaskCard = ({ task }: { task: Task }) => {
  return (
    <Card className={cn(
      "border border-gray-800 bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm transition-all duration-300 hover:shadow-md hover:shadow-purple-500/10",
      task.status === 'completed' && "opacity-80 hover:opacity-100"
    )}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base font-medium">{task.title}</CardTitle>
          <PriorityBadge priority={task.priority} />
        </div>
        <CardDescription className="line-clamp-2">{task.description}</CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        {task.status === 'in-progress' && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Progress</span>
              <span>{task.progress}%</span>
            </div>
            <Progress value={task.progress} className="h-2" />
          </div>
        )}
        
        <div className="flex flex-wrap gap-1 mb-3">
          {task.tags.map(tag => (
            <Badge key={tag} variant="outline" className="text-xs bg-primary/5">
              <Tag className="h-3 w-3 mr-1" />
              {tag}
            </Badge>
          ))}
        </div>
        
        {task.dueDate && (
          <div className="flex items-center text-xs text-muted-foreground">
            <Calendar className="h-3 w-3 mr-1" />
            <span>Due: {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between pt-2">
        <div className="flex items-center text-xs text-muted-foreground">
          <Clock className="h-3 w-3 mr-1" />
          <span>Created {new Date(task.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-white">
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

const PriorityBadge = ({ priority }: { priority: Task['priority'] }) => {
  if (priority === 'high') {
    return <Badge variant="destructive" className="text-xs">High Priority</Badge>;
  }
  if (priority === 'medium') {
    return <Badge variant="secondary" className="text-xs bg-amber-500/20 text-amber-400">Medium Priority</Badge>;
  }
  return <Badge variant="outline" className="text-xs">Low Priority</Badge>;
};

export default TaskGroups;
