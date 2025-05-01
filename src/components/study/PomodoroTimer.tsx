import React, { useState, useEffect, useRef } from 'react';
// Add console log to debug component loading
console.log('PomodoroTimer component loaded');
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';
import { Play, Pause, RotateCcw, Settings, CheckCircle2, Bell } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface PomodoroSession {
  date: string;
  duration: number;
  type: 'focus' | 'break';
}

interface PomodoroState {
  sessions: PomodoroSession[];
  focusDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  longBreakInterval: number;
}

const PomodoroTimer = () => {
  // Timer states
  const [timeLeft, setTimeLeft] = useState(25 * 60); // Default 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<'focus' | 'shortBreak' | 'longBreak'>('focus');
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  
  // Settings
  const [focusDuration, setFocusDuration] = useState(25);
  const [shortBreakDuration, setShortBreakDuration] = useState(5);
  const [longBreakDuration, setLongBreakDuration] = useState(15);
  const [longBreakInterval, setLongBreakInterval] = useState(4);
  
  // Session history
  const [sessions, setSessions] = useState<PomodoroSession[]>([]);
  
  // Audio refs
  const alarmSound = useRef<HTMLAudioElement | null>(null);
  const tickSound = useRef<HTMLAudioElement | null>(null);
  
  // Effect for creating audio elements
  useEffect(() => {
    alarmSound.current = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3');
    tickSound.current = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-clock-tick-1059.mp3');
    
    return () => {
      if (alarmSound.current) {
        alarmSound.current.pause();
        alarmSound.current = null;
      }
      if (tickSound.current) {
        tickSound.current.pause();
        tickSound.current = null;
      }
    };
  }, []);
  
  // Load saved state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('pomodoroState');
    if (savedState) {
      try {
        const { sessions, focusDuration, shortBreakDuration, longBreakDuration, longBreakInterval } = JSON.parse(savedState) as PomodoroState;
        setSessions(sessions || []);
        setFocusDuration(focusDuration || 25);
        setShortBreakDuration(shortBreakDuration || 5);
        setLongBreakDuration(longBreakDuration || 15);
        setLongBreakInterval(longBreakInterval || 4);
        
        // Initialize timer based on current mode
        setTimeLeft(focusDuration * 60);
      } catch (error) {
        console.error('Error parsing saved pomodoro state:', error);
      }
    }
  }, []);
  
  // Save state to localStorage when it changes
  useEffect(() => {
    const stateToSave: PomodoroState = {
      sessions,
      focusDuration,
      shortBreakDuration,
      longBreakDuration,
      longBreakInterval
    };
    localStorage.setItem('pomodoroState', JSON.stringify(stateToSave));
  }, [sessions, focusDuration, shortBreakDuration, longBreakDuration, longBreakInterval]);
  
  // Timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          // Play tick sound every 10 seconds if time is less than 60 seconds
          if (prevTime <= 60 && prevTime % 10 === 0 && tickSound.current) {
            tickSound.current.play().catch(e => console.error('Error playing tick sound:', e));
          }
          return prevTime - 1;
        });
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      setIsRunning(false);
      handleTimerComplete();
    }
    
    return () => clearInterval(timer);
  }, [isRunning, timeLeft]);
  
  // Handle timer completion
  const handleTimerComplete = () => {
    // Play alarm sound
    if (alarmSound.current) {
      alarmSound.current.play().catch(e => console.error('Error playing alarm:', e));
    }
    
    // Record completed session
    const newSession: PomodoroSession = {
      date: new Date().toISOString(),
      duration: getCurrentModeDuration() * 60,
      type: mode === 'focus' ? 'focus' : 'break'
    };
    
    setSessions([...sessions, newSession]);
    
    // Show notification
    toast({
      title: `${mode.charAt(0).toUpperCase() + mode.slice(1)} session completed!`,
      description: mode === 'focus' 
        ? "Great job! Take a break now." 
        : "Break's over. Ready to focus again?",
    });
    
    // Switch to next mode
    if (mode === 'focus') {
      const nextSessionNumber = sessionsCompleted + 1;
      setSessionsCompleted(nextSessionNumber);
      
      // Check if it's time for a long break
      if (nextSessionNumber % longBreakInterval === 0) {
        setMode('longBreak');
        setTimeLeft(longBreakDuration * 60);
      } else {
        setMode('shortBreak');
        setTimeLeft(shortBreakDuration * 60);
      }
    } else {
      // After any break, go back to focus mode
      setMode('focus');
      setTimeLeft(focusDuration * 60);
    }
  };
  
  // Get the current mode's duration in minutes
  const getCurrentModeDuration = () => {
    switch (mode) {
      case 'focus': return focusDuration;
      case 'shortBreak': return shortBreakDuration;
      case 'longBreak': return longBreakDuration;
      default: return focusDuration;
    }
  };
  
  // Start/pause timer
  const toggleTimer = () => {
    setIsRunning(!isRunning);
    
    // Play or pause tick sound
    if (!isRunning && tickSound.current && timeLeft <= 60) {
      tickSound.current.play().catch(e => console.error('Error playing tick sound:', e));
    } else if (isRunning && tickSound.current) {
      tickSound.current.pause();
      tickSound.current.currentTime = 0;
    }
  };
  
  // Reset timer
  const resetTimer = () => {
    setIsRunning(false);
    if (tickSound.current) {
      tickSound.current.pause();
      tickSound.current.currentTime = 0;
    }
    setTimeLeft(getCurrentModeDuration() * 60);
  };
  
  // Switch mode
  const switchMode = (newMode: 'focus' | 'shortBreak' | 'longBreak') => {
    setIsRunning(false);
    setMode(newMode);
    switch (newMode) {
      case 'focus':
        setTimeLeft(focusDuration * 60);
        break;
      case 'shortBreak':
        setTimeLeft(shortBreakDuration * 60);
        break;
      case 'longBreak':
        setTimeLeft(longBreakDuration * 60);
        break;
    }
  };
  
  // Save settings
  const saveSettings = () => {
    setTimeLeft(mode === 'focus' ? focusDuration * 60 : 
                mode === 'shortBreak' ? shortBreakDuration * 60 : 
                longBreakDuration * 60);
    setShowSettings(false);
  };
  
  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Calculate progress percentage
  const calculateProgress = () => {
    const totalSeconds = getCurrentModeDuration() * 60;
    return ((totalSeconds - timeLeft) / totalSeconds) * 100;
  };

  return (
    <Card className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 p-6 rounded-xl border border-gray-700 shadow-xl backdrop-blur-sm">
      <div className="flex flex-col items-center">
        <div className="mb-6 w-full flex justify-between items-center">
          <h3 className="text-lg font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Pomodoro Timer
          </h3>
          <div className="flex space-x-2">
            <Dialog open={showSettings} onOpenChange={setShowSettings}>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8">
                  <Settings className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-900 border border-gray-700">
                <DialogHeader>
                  <DialogTitle>Timer Settings</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <div className="space-y-2">
                    <Label htmlFor="focusDuration">Focus Duration (minutes)</Label>
                    <Input
                      id="focusDuration"
                      type="number"
                      min="1"
                      max="120"
                      value={focusDuration}
                      onChange={(e) => setFocusDuration(parseInt(e.target.value) || 25)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shortBreakDuration">Short Break (minutes)</Label>
                    <Input
                      id="shortBreakDuration"
                      type="number"
                      min="1"
                      max="30"
                      value={shortBreakDuration}
                      onChange={(e) => setShortBreakDuration(parseInt(e.target.value) || 5)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="longBreakDuration">Long Break (minutes)</Label>
                    <Input
                      id="longBreakDuration"
                      type="number"
                      min="1"
                      max="60"
                      value={longBreakDuration}
                      onChange={(e) => setLongBreakDuration(parseInt(e.target.value) || 15)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="longBreakInterval">Long Break Interval (sessions)</Label>
                    <Input
                      id="longBreakInterval"
                      type="number"
                      min="1"
                      max="10"
                      value={longBreakInterval}
                      onChange={(e) => setLongBreakInterval(parseInt(e.target.value) || 4)}
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={saveSettings}>Save Settings</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        <div className="w-full mb-6">
          <div className="relative pt-1 w-full">
            <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-700">
              <div
                style={{ inlineSize: `${calculateProgress()}%` }}
                className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center 
                  ${mode === 'focus' ? 'bg-purple-500' : mode === 'shortBreak' ? 'bg-green-500' : 'bg-blue-500'}`}
              ></div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-center mb-8">
          <div 
            className={`text-5xl font-bold text-center p-6 rounded-full w-48 h-48 flex items-center justify-center
              ${mode === 'focus' 
                ? 'bg-purple-500/10 text-purple-300 border-2 border-purple-500/30' 
                : mode === 'shortBreak' 
                  ? 'bg-green-500/10 text-green-300 border-2 border-green-500/30' 
                  : 'bg-blue-500/10 text-blue-300 border-2 border-blue-500/30'}`}
          >
            {formatTime(timeLeft)}
          </div>
        </div>
        
        <div className="flex justify-center space-x-2 mb-6">
          <Button
            variant={mode === 'focus' ? "default" : "outline"}
            onClick={() => switchMode('focus')}
            className={mode === 'focus' ? 'bg-purple-500 hover:bg-purple-600' : ''}
          >
            Focus
          </Button>
          <Button
            variant={mode === 'shortBreak' ? "default" : "outline"}
            onClick={() => switchMode('shortBreak')}
            className={mode === 'shortBreak' ? 'bg-green-500 hover:bg-green-600' : ''}
          >
            Short Break
          </Button>
          <Button
            variant={mode === 'longBreak' ? "default" : "outline"}
            onClick={() => switchMode('longBreak')}
            className={mode === 'longBreak' ? 'bg-blue-500 hover:bg-blue-600' : ''}
          >
            Long Break
          </Button>
        </div>
        
        <div className="flex justify-center space-x-4">
          <Button 
            onClick={toggleTimer} 
            className={`w-16 h-16 rounded-full ${isRunning ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
          >
            {isRunning ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
          </Button>
          <Button 
            onClick={resetTimer} 
            variant="outline" 
            className="w-16 h-16 rounded-full"
            disabled={timeLeft === getCurrentModeDuration() * 60}
          >
            <RotateCcw className="h-6 w-6" />
          </Button>
        </div>
        
        <div className="mt-6 text-sm text-center text-gray-400">
          <p>Session #{sessionsCompleted + 1} • Completed today: {sessions.filter(s => 
            new Date(s.date).toDateString() === new Date().toDateString() && s.type === 'focus'
          ).length}</p>
        </div>
      </div>
    </Card>
  );
};

export default PomodoroTimer;
