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
const SOUNDS = {
  END_WORK: "/sounds/BreakSound.MP3",
  END_BREAK: "/sounds/WorkSound.MP3"
}

// convert minutes to seconds
function minutesToSeconds(minutes) {
  return minutes * 60;
}

export default function App() {
  // state manager
  const [isTimeEditMode, setIsTimeEditMode] = useState(true);
  const [isSoundEnable, setIsSoundEnable] = useLocalStorage('isSoundEnable', true);
  const [workDuration, setWorkDuration] = useLocalStorage('workDuration', 25);
  const [breakDuration, setBreakDuration] = useLocalStorage('breakDuration', 5);
  const [tasks, setTasks] = useLocalStorage('tasks', []);

  const [isRunning, setIsRunning] = useState(false);
  const [isWorkMode, setIsWorkMode] = useState(true);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const timeRemainingRef = useRef(0); // Holds actual seconds
  const [displayTime, setDisplayTime] = useState(0);

  // Refs for audio elements
  // Ref to audio element, render without re-initializing, ensuring that the same audio objects are used in lifecycle
  // Direct DOM Manipulation, control playback methods like play() and pause()
  const workEndSoundRef = useRef(null);
  const breakEndSoundRef = useRef(null);

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
  },[]);

  const playSound = useCallback((soundRef) => {
    if (isSoundEnable && soundRef.current) {
      soundRef.current.currentTime = 0;
      soundRef.current.play().catch(err => console.log("Audio play error:", err));
    }
  }, [isSoundEnable]);

  useEffect(() => {
    if (!isRunning) return;

    const startTime = Date.now();
    const expectedEnd = startTime + timeRemainingRef.current * 1000;

    const timer = setInterval(() => {
      const secondsLeft = Math.max(0, Math.floor((expectedEnd - Date.now()) / 1000));
      timeRemainingRef.current = secondsLeft;
      setDisplayTime(secondsLeft);
      const modePrefix = isWorkMode ? " - Work" : " - Break";
      const runningTitle = formatTime(secondsLeft) + modePrefix;
      document.title = runningTitle;

      if (secondsLeft === 0) {
        clearInterval(timer); // Stop the interval before switching

        if (isWorkMode) {
          playSound(workEndSoundRef);
          timeRemainingRef.current = minutesToSeconds(breakDuration);
          setIsWorkMode(false);
          setDisplayTime(timeRemainingRef.current);
        } else {
          playSound(breakEndSoundRef);
          timeRemainingRef.current = minutesToSeconds(workDuration);
          setIsWorkMode(true);
          setDisplayTime(timeRemainingRef.current);
        }
      }
    }, 1000); // Still run every second, but calculate based on real time

    return () => {
      document.title = APP_TITLE
      clearInterval(timer) };
  }, [isRunning, isWorkMode, workDuration, breakDuration]);


  // Handle work duration change
  const handleWorkDurationChange = useCallback((newValue) => {
    setIsRunning(false);
    setWorkDuration(newValue);
    timeRemainingRef.current = 0;
    setIsWorkMode(true);
    setIsTimeEditMode(true);
  }, []);

  // Handle break duration change
  const handleBreakDurationChange = useCallback((newValue) => {
    setIsRunning(false);
    setBreakDuration(newValue);
    timeRemainingRef.current = 0;
    setDisplayTime(timeRemainingRef.current);
    setIsWorkMode(false);
    setIsTimeEditMode(true);
  }, []);
  

  // Toggle between work and break modes
  const toggleMode = useCallback(() => {
    setIsWorkMode(prev => !prev);
    setIsTimeEditMode(true);
    timeRemainingRef.current = minutesToSeconds(isWorkMode ? workDuration : breakDuration);
    setDisplayTime(timeRemainingRef.current);
  }, []);

  // Start or pause the timer
  const toggleTimer = useCallback(() => {
    if (!isRunning) {
      timeRemainingRef.current = minutesToSeconds(isWorkMode ? workDuration : breakDuration);
      setDisplayTime(timeRemainingRef.current);
      setIsTimeEditMode(false);
    }
    setIsRunning(prev => !prev);
  }, [isRunning, isWorkMode, workDuration, breakDuration]);

  // Reset the timer
  const resetTimer = useCallback(() => {
    setIsRunning(false);
    timeRemainingRef.current = minutesToSeconds(isWorkMode ? workDuration : breakDuration);
    setDisplayTime(timeRemainingRef.current);
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
    <div className="flex bg-white flex-col items-center gap-2">
      <div className="container mx-auto text-center justify-between flex w-full border-b p-4">
          <div className="flex gap-2">
          <img src="../icon.png" alt="" className="w-8 h-8"/>
          <h1 className="text-md mt-2 font-extrabold text-center">PORO FOCUS</h1>
          </div>
      </div>
      <div className="flex-col flex items-center">
        <h3 className="font-light text-sm text-gray-500">Stay productive with cute companions</h3>
        {/* Mode indicator */}
        <div className="flex gap-2 w-full justify-center p-4">
          {isWorkMode ? <AlarmClock /> : <Coffee />}
          <h1 className="text-xl">{isWorkMode ? "Work Time" : "Break Time"}</h1>
          {/* Focus Mode */}
          <Button disabled = {!isRunning} onClick={() => setIsFocusMode(true)}
            className="text-neutral-500 mx-2
            border-transparent focus:outline-none focus:bg-transparent
            hover:shadow-none hover:text-neutral hover:bg-transparent
            focus:ring-0 active:bg-transparent">
            <Maximize size={20}/>
          </Button>
          </div>

        {/* Timer display */}
        <span className="text-9xl font-bold transition-transform duration-300 hover:scale-110">
          {isTimeEditMode ?
            `${String(isWorkMode ? workDuration : breakDuration).padStart(2, '0')}:00` :
            formatTime(displayTime)}
        </span>

        {/* Control buttons */}
        <div className="flex m-6 justify-center gap-6 w-full">
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
