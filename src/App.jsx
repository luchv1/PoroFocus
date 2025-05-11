import { useEffect, useState, useCallback, useRef } from "react";
import Tabs from "./components/Tabs";
import {Bell, CircleCheckBig, Maximize, Clock5, Sprout, CirclePlay, CirclePause, RotateCcw, BriefcaseBusiness, Coffee, AlarmClock } from "lucide-react";
import Range from "./components/Range";
import TasksTab from "./components/TasksTab";
import Button from "./components/Button";
import FocusMode from "./components/FocusMode";
import useLocalStorage from "./hooks/useLocalStorage"

const APP_TITLE = "Poro Focus";
const TABS_BTN_BLOCK_CLASSES = "p-2 flex gap-2 items-center justify-center";
const BUTTON_CLASSES = "btn btn-circle btn-xl btn-neutral transition-transform duration-300 hover:scale-110 hover:shadow-lg";
const ICONS = [
  "🫠",
  "😑",
  "🤓",
  "🥱"
]
const SOUNDS = {
  END_WORK: "/sounds/BreakSound.MP3",
  END_BREAK: "/sounds/WorkSound.MP3"
}

// convert minutes to seconds
function minutesToSeconds(minutes) {
  return minutes * 60;
}

const DEFAULT_SETTING = {
  workDuration: 25,
  breakDuration: 5,
  notification: true,
  tasks: []
}

const LOCAL_STORAGE_KEY = "timerSetting";

export default function App() {
  // state manager
  const [isTimeEditMode, setIsTimeEditMode] = useState(true);
  const [isSoundEnable, setIsSoundEnable] = useLocalStorage('isSoundEnable', true);
  const [workDuration, setWorkDuration] = useLocalStorage('workDuration', 25);
  const [breakDuration, setBreakDuration] = useLocalStorage('breakDuration', 5);
  const [tasks, setTasks] = useLocalStorage('tasks', []);

  const [isRunning, setIsRunning] = useState(false);
  const [isWorkMode, setIsWorkMode] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [icon, setIcon] = useState(ICONS[0]);


  // Refs for audio elements
  // Ref to audio element, render without re-initializing, ensuring that the same audio objects are used in lifecycle
  // Direct DOM Manipulation, control playback methods like play() and pause()
  const workEndSoundRef = useRef(null);
  const breakEndSoundRef = useRef(null);

  const displayTime = (!isRunning && timeRemaining === 0) ? (isWorkMode ? workDuration * 60 : breakDuration * 60) : timeRemaining;
  // Initialize audio elements
  useEffect(() => {
    workEndSoundRef.current = new Audio(SOUNDS.END_WORK);
    breakEndSoundRef.current = new Audio(SOUNDS.END_BREAK);

    const preloadAudio = (audio) => {
      audio.load();
    };

    preloadAudio(workEndSoundRef.current);
    preloadAudio(breakEndSoundRef.current);

    return () => {
      // Cleanup audio element
      workEndSoundRef.current = null;
      breakEndSoundRef.current = null;
    }
  })

  // play sound
  const playSound = useCallback((soundRef) => {
    if (isSoundEnable && soundRef.current) {
      soundRef.current.currentTime = 0;
      soundRef.current.play().catch(err => console.log("Audio play error:", err));
    }
  }, [isSoundEnable])

  // Update document title based on timer state
  useEffect(() => {
    if (isRunning) {
      const modePrefix = isWorkMode ? " Work" : " Break";
      const runningTitle = formatTime(timeRemaining) + modePrefix;
      document.title = runningTitle;
    } else {
      document.title = APP_TITLE
    }
  },)

  // Update icon based on work duration
  useEffect(() => {
    if (workDuration <= 25) {
      setIcon(ICONS[0]);
    } else if (workDuration <= 45) {
      setIcon(ICONS[1]);
    } else if (workDuration <= 70) {
      setIcon(ICONS[2]);
    } else {
      setIcon(ICONS[3]);
    }
  }, [workDuration]);

  useEffect(() => {
    if (!isRunning) return;

    // Switch modes if timer reaches zero
    if (timeRemaining === 0) {
      if (isWorkMode) {
        // play sounds the end work mode
        playSound(workEndSoundRef);
        // wait 2 seconds before staring break
        setTimeout(() => {
          setTimeRemaining(minutesToSeconds(breakDuration));
          setIsWorkMode(false);
        }, 3000);
      } else {
        playSound(breakEndSoundRef);
        // wait 2 seconds before starting work
        setTimeout(() => {
          setTimeRemaining(minutesToSeconds(workDuration));
          setIsWorkMode(true);
        }, 3000);
      }
    }

    // reduce time
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        const newValue = Math.max(0, prev - 1);
        return newValue;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, timeRemaining, isWorkMode, workDuration, breakDuration]);

  // Handle work duration change
  const handleWorkDurationChange = useCallback((newValue) => {
    setIsRunning(false);
    setWorkDuration(newValue);
    setTimeRemaining(0);
    setIsWorkMode(true);
    setIsTimeEditMode(true);
  }, []);

  // Handle break duration change
  const handleBreakDurationChange = useCallback((newValue) => {
    setIsRunning(false);
    setBreakDuration(newValue);
    setTimeRemaining(0);
    setIsWorkMode(false);
    setIsTimeEditMode(true);
  }, []);
  

  // Toggle between work and break modes
  const toggleMode = useCallback(() => {
    setIsWorkMode(prev => !prev);
    setIsTimeEditMode(true);
    setTimeRemaining(0);
  }, []);

  // Start or pause the timer
  const toggleTimer = useCallback(() => {
    if (!isRunning && timeRemaining === 0) {
      setTimeRemaining(minutesToSeconds(isWorkMode ? workDuration : breakDuration));
      setIsTimeEditMode(false);
    }
    setIsRunning(prev => !prev);

    if(!isRunning) {
      const newSetting = {
        ...timerSetting,
        workDuration: workDuration,
        breakDuration: breakDuration,
        notification: isSoundEnable,
      }
      setTimerSetting(newSetting);
    }

  }, [isRunning, timeRemaining, isWorkMode, workDuration, breakDuration]);

  // Reset the timer
  const resetTimer = useCallback(() => {
    setIsWorkMode(true);
    setIsRunning(false);
    setTimeRemaining(0);
    setIsTimeEditMode(true);
  }, []);

  const changeTaskStatus = ((id) => {
    setTasks(prev =>
        prev.map(task => task.id === id ?
            {...task, status: !task.status} : task));
})
  
  // Format time for display (mm:ss)
  const formatTime = useCallback((seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  }, []);

  // Tab data
  const tabsData = [
    {
      key: "Timer",
      label: <div className={TABS_BTN_BLOCK_CLASSES}><AlarmClock /> Timer</div>,
      content: (
        <div className="card shadow-sm">
          <div className="flex flex-col mb-1">
            <div className="flex justify-between flex-row gap-2 py-2">
              <div className="font-bold flex gap-2"> <Bell /> Notification </div>
                <input
                  type="checkbox"
                  checked={isSoundEnable}
                  onChange={(e) => setIsSoundEnable(e.target.checked)}
                  className="toggle" />
              </div>
          </div>
          <Range
            key="Work"
            title="Work Duration"
            icon={<Clock5 />}
            max="90"
            currentValue={workDuration}
            onChange={handleWorkDurationChange}
          />
          <Range
            key="Break"
            title="Break Duration"
            icon={<Sprout />}
            max="50"
            currentValue={breakDuration}
            onChange={handleBreakDurationChange}
          />
        </div>
      )
    },
    {
      key: "Tasks",
      label: <div className={TABS_BTN_BLOCK_CLASSES}><CircleCheckBig /> Tasks</div>,
      content: <TasksTab
        tasks={tasks}
        setTasks={setTasks}
      />
    },
  ];
  return (
    <div className="py-8 flex flex-col items-center gap-2">
      <div className="container mx-auto px-2 text-center">
        <h1 className="text-4xl font-extrabold text-center">PORO FOCUS</h1>
        <h3 className="font-light text-gray-500">Stay productive with cute companions</h3>
      </div>
      <div className="flex-col md:shadow-md md:p-4 flex items-center rounded-xl card">

        {/* Focus Mode */}
        <div className="flex justify-end w-96">
          <Button onClick={() => setIsFocusMode(true)}
              className="text-neutral-500 ml-auto btn btn-ghost border-transparent focus:outline-none focus:bg-transparent hover:shadow-none hover:text-neutral hover:bg-transparent focus:ring-0 active:bg-transparent">
            <Maximize size={20}/>
          </Button>
        </div>
        {/* Mode indicator */}
        <div className="flex gap-2">
          {isWorkMode ? <AlarmClock /> : <Coffee />}
          <h1 className="text-xl">{isWorkMode ? "Work Time" : "Break Time"}</h1>
        </div>

        {/* Timer display */}
        <span className="text-9xl font-bold">
          {isTimeEditMode ?
            `${String(isWorkMode ? workDuration : breakDuration).padStart(2, '0')}:00` :
            formatTime(displayTime)}
        </span>

        {/* Icon display */}
        <div className="card text-6xl py-4">
          <h1 className="transition-transform duration-150">{icon}</h1>
        </div>

        {/* Control buttons */}
        <div className="flex m-6 justify-evenly w-96">
          {!isRunning && (
            <button onClick={resetTimer} className={BUTTON_CLASSES}>
              <RotateCcw />
            </button>
          )}

          <button onClick={toggleTimer} className={`${BUTTON_CLASSES} w-24 h-24`}>
            {isRunning ? <CirclePause /> : <CirclePlay />}
          </button>

          {!isRunning && (
            <button onClick={toggleMode} className={BUTTON_CLASSES}>
              {isWorkMode ? <Coffee /> : <AlarmClock />}
            </button>
          )}
        </div>

        {/* Only show tabs when timer is not running */}
        { (
          <div>
            <Tabs tabs={tabsData} init="Timer"/>
          </div>
        )}

        {/* Focus Mode */}
          <FocusMode
            isOpen={isFocusMode}
            onClose={() => setIsFocusMode(false)}
            timeDisplay={formatTime(displayTime)}
            tasks={tasks}
            onChangeStatus={changeTaskStatus}
          />
      </div>
    </div>
  );
}
