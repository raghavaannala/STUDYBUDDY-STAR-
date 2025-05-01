import React, { useState, useEffect } from 'react';
// Add console log to debug component loading
console.log('StudyAnalytics component loaded');
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

interface StudySession {
  date: string;
  duration: number;
  subject: string;
}

interface PomodoroSession {
  date: string;
  duration: number;
  type: 'focus' | 'break';
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe', '#00C49F', '#FFBB28', '#FF8042'];

const StudyAnalytics = () => {
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);
  const [pomodoroSessions, setPomodoroSessions] = useState<PomodoroSession[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month'>('week');
  
  // Load study sessions data
  useEffect(() => {
    // First try to load from localStorage
    const savedStudySessions = localStorage.getItem('studySessions');
    const savedPomodoroState = localStorage.getItem('pomodoroState');
    
    if (savedStudySessions) {
      setStudySessions(JSON.parse(savedStudySessions));
    } else {
      // Fallback to demo data
      const demoSessions = generateDemoStudySessions();
      setStudySessions(demoSessions);
      localStorage.setItem('studySessions', JSON.stringify(demoSessions));
    }
    
    if (savedPomodoroState) {
      const pomodoroData = JSON.parse(savedPomodoroState);
      if (pomodoroData.sessions) {
        setPomodoroSessions(pomodoroData.sessions);
      } else {
        // Fallback to demo data
        const demoPomodoroSessions = generateDemoPomodoroSessions();
        setPomodoroSessions(demoPomodoroSessions);
      }
    } else {
      // Fallback to demo data
      const demoPomodoroSessions = generateDemoPomodoroSessions();
      setPomodoroSessions(demoPomodoroSessions);
    }
  }, []);
  
  // Get current date for comparisons
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Helper to filter data by timeframe
  const filterByTimeframe = (date: string) => {
    const sessionDate = new Date(date);
    sessionDate.setHours(0, 0, 0, 0);
    
    const diffDays = Math.floor((today.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
    
    switch (timeframe) {
      case 'day':
        return diffDays === 0;
      case 'week':
        return diffDays < 7;
      case 'month':
        return diffDays < 30;
      default:
        return true;
    }
  };
  
  // Overview metrics
  const totalStudyTime = studySessions
    .filter(session => filterByTimeframe(session.date))
    .reduce((total, session) => total + session.duration, 0);
  
  const totalFocusTime = pomodoroSessions
    .filter(session => filterByTimeframe(session.date) && session.type === 'focus')
    .reduce((total, session) => total + session.duration, 0);
  
  const totalSessions = pomodoroSessions
    .filter(session => filterByTimeframe(session.date) && session.type === 'focus')
    .length;
  
  const averageSessionTime = totalSessions > 0 ? Math.round(totalFocusTime / totalSessions / 60) : 0;
  
  // Daily study data for bar chart
  const getDailyData = () => {
    const lastNDays = timeframe === 'day' ? 1 : timeframe === 'week' ? 7 : 30;
    const data = [];
    
    for (let i = 0; i < lastNDays; i++) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const dateString = date.toISOString().split('T')[0];
      const label = i === 0 ? 'Today' : 
                  i === 1 ? 'Yesterday' : 
                  date.toLocaleDateString('en-US', { weekday: 'short' });
      
      const focusMinutes = pomodoroSessions
        .filter(session => session.date.startsWith(dateString) && session.type === 'focus')
        .reduce((total, session) => total + session.duration, 0) / 60;
      
      data.unshift({
        name: label,
        minutes: Math.round(focusMinutes),
        date: dateString
      });
    }
    
    return data;
  };
  
  // Subject distribution data for pie chart
  const getSubjectData = () => {
    const subjectMap: Record<string, number> = {};
    
    studySessions
      .filter(session => filterByTimeframe(session.date))
      .forEach(session => {
        const { subject, duration } = session;
        subjectMap[subject] = (subjectMap[subject] || 0) + duration;
      });
    
    return Object.entries(subjectMap).map(([name, value]) => ({
      name,
      value: Math.round(value / 60) // Convert to minutes
    }));
  };
  
  // Weekly progress data for line chart
  const getWeeklyProgressData = () => {
    const weeks: Record<string, number> = {};
    const now = new Date();
    
    // Get last 10 weeks
    for (let i = 0; i < 10; i++) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (now.getDay() + 7 * i));
      const weekLabel = `Week ${i + 1}`;
      weeks[weekLabel] = 0;
    }
    
    // Populate with actual data
    pomodoroSessions
      .filter(session => session.type === 'focus')
      .forEach(session => {
        const sessionDate = new Date(session.date);
        const weekDiff = Math.floor((now.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24 * 7));
        
        if (weekDiff < 10) {
          const weekLabel = `Week ${weekDiff + 1}`;
          weeks[weekLabel] = (weeks[weekLabel] || 0) + session.duration / 60;
        }
      });
    
    return Object.entries(weeks)
      .map(([name, value]) => ({ name, minutes: Math.round(value) }))
      .reverse()
      .slice(0, 10);
  };
  
  // Format minutes to hours and minutes
  const formatMinutes = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };
  
  // Helper function to generate demo study sessions
  function generateDemoStudySessions(): StudySession[] {
    const subjects = ['Programming', 'Mathematics', 'Science', 'Language', 'History'];
    const sessions: StudySession[] = [];
    
    // Generate sessions for the last 30 days
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Generate 1-3 sessions per day
      const sessionsPerDay = Math.floor(Math.random() * 3) + 1;
      
      for (let j = 0; j < sessionsPerDay; j++) {
        const subject = subjects[Math.floor(Math.random() * subjects.length)];
        const duration = (Math.floor(Math.random() * 90) + 30) * 60; // 30-120 minutes in seconds
        
        sessions.push({
          date: date.toISOString(),
          duration,
          subject
        });
      }
    }
    
    return sessions;
  }
  
  // Helper function to generate demo pomodoro sessions
  function generateDemoPomodoroSessions(): PomodoroSession[] {
    const sessions: PomodoroSession[] = [];
    
    // Generate sessions for the last 30 days
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Generate 0-8 focus sessions per day
      const focusSessionsPerDay = Math.floor(Math.random() * 9);
      
      for (let j = 0; j < focusSessionsPerDay; j++) {
        // Typical pomodoro is 25 minutes
        const duration = 25 * 60;
        
        sessions.push({
          date: date.toISOString(),
          duration,
          type: 'focus'
        });
        
        // Add a break after each focus session
        const breakDuration = (Math.random() > 0.2 ? 5 : 15) * 60; // 5 or 15 minutes
        
        sessions.push({
          date: date.toISOString(),
          duration: breakDuration,
          type: 'break'
        });
      }
    }
    
    return sessions;
  }

  return (
    <Card className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 p-6 rounded-xl border border-gray-700 shadow-xl backdrop-blur-sm overflow-hidden">
      <div className="flex flex-col">
        <div className="mb-6 flex justify-between items-center">
          <h3 className="text-lg font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Study Analytics
          </h3>
          <div className="flex space-x-2">
            <button 
              onClick={() => setTimeframe('day')}
              className={`px-2 py-1 text-xs rounded ${timeframe === 'day' ? 'bg-purple-500 text-white' : 'text-gray-400 hover:bg-gray-800'}`}
            >
              Today
            </button>
            <button 
              onClick={() => setTimeframe('week')}
              className={`px-2 py-1 text-xs rounded ${timeframe === 'week' ? 'bg-purple-500 text-white' : 'text-gray-400 hover:bg-gray-800'}`}
            >
              Week
            </button>
            <button 
              onClick={() => setTimeframe('month')}
              className={`px-2 py-1 text-xs rounded ${timeframe === 'month' ? 'bg-purple-500 text-white' : 'text-gray-400 hover:bg-gray-800'}`}
            >
              Month
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
            <h4 className="text-sm text-gray-400 mb-1">Total Study Time</h4>
            <p className="text-2xl font-bold text-white">{formatMinutes(totalStudyTime / 60)}</p>
          </div>
          <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
            <h4 className="text-sm text-gray-400 mb-1">Focus Sessions</h4>
            <p className="text-2xl font-bold text-white">{totalSessions}</p>
          </div>
          <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
            <h4 className="text-sm text-gray-400 mb-1">Avg. Session Length</h4>
            <p className="text-2xl font-bold text-white">{averageSessionTime} min</p>
          </div>
        </div>
        
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="overview">Daily Activity</TabsTrigger>
            <TabsTrigger value="subjects">Subjects</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={getDailyData()} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="name" stroke="#888" />
                <YAxis stroke="#888" label={{ value: 'Minutes', angle: -90, position: 'insideLeft', fill: '#888' }} />
                <Tooltip 
                  formatter={(value) => [`${value} minutes`, 'Study Time']}
                  contentStyle={{ backgroundColor: '#333', border: '1px solid #555' }}
                />
                <Bar dataKey="minutes" fill="#8884d8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
          
          <TabsContent value="subjects" className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={getSubjectData()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {getSubjectData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`${value} minutes`, 'Study Time']}
                  contentStyle={{ backgroundColor: '#333', border: '1px solid #555' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </TabsContent>
          
          <TabsContent value="trends" className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={getWeeklyProgressData()} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="name" stroke="#888" />
                <YAxis stroke="#888" label={{ value: 'Minutes', angle: -90, position: 'insideLeft', fill: '#888' }} />
                <Tooltip 
                  formatter={(value) => [`${value} minutes`, 'Study Time']}
                  contentStyle={{ backgroundColor: '#333', border: '1px solid #555' }}
                />
                <Line type="monotone" dataKey="minutes" stroke="#8884d8" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
        
        <div className="mt-4 text-xs text-center text-gray-500">
          {timeframe === 'day' ? 'Showing data for today' : 
           timeframe === 'week' ? 'Showing data for the last 7 days' : 
           'Showing data for the last 30 days'}
        </div>
      </div>
    </Card>
  );
};

export default StudyAnalytics;
