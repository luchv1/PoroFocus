'use client'
import { useEffect, useRef, useState } from "react";
import { Briefcase, BookOpen, Dumbbell, Plus, ChefHat, Clapperboard } from "lucide-react";
import useLocalStorage from "../hooks/useLocalStorage";
import Input from "./Input"
import Task from "./Task";
import Button from "./Button"
const ICONS = [
    {
        type: 'work',
        icon: <Briefcase />
    },
    {
        type: 'study',
        icon: <BookOpen />
    },
    {
        type: 'exercise',
        icon: <Dumbbell />
    },
    {
        type: 'cook',
        icon: <ChefHat />
    },
    {
        type: 'firm',
        icon: <Clapperboard />
    }
];
export default function TasksTab() {
    const [tasks, setTasks] = useLocalStorage('tasks', []);
    const [title, setTitle] = useState("");
    const [selectedType, setSelectedType] = useState(0);
    const inputRef = useRef(null);

    // save tasks to localstorage

    const handleAddTask = (() => {
            if (!title) {
                return;
            }
            const newTask = {
                id: String(Date.now()),
                title: title,
                icon: selectedType,
                status: false
            }

            // add new task to the title
            setTasks(prev => [
                ...prev, newTask
            ]);
            setTitle("");
            inputRef.current.focus();
        })

    const handleDeleteTask = ((id) => {
        // return element no have input id
        setTasks(tasks.filter(task => task.id != id));
    })

    const changeTaskStatus = ((id) => {
        setTasks(prev =>
            prev.map(task => task.id === id ?
                {...task, status: !task.status} : task));
    })

    return (
        <div>
            <div className="flex w-100 justify-center space-x-2 m-2">
                <Input
                    classes="input input-neutral input input-bordered"
                    placeholder="Add a new task..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    ref={inputRef}
                />
                <Button
                    disabled={title ? false : true}
                    classes="btn btn-neutral"
                    onClick={handleAddTask}
                >
                    <Plus />
                </Button>
            </div>
            {/* display icon */}
            <div className="flex justify-around gap-2 py-2">
                {ICONS.map((item, index) => 
                    <Button
                        key={item.type}
                        className={index === selectedType ? `btn btn-neutral` : `btn btn-outline`}
                        onClick={() => setSelectedType(index)}
                    >{item.icon}</Button>
                )}
            </div>
            {/* display task */}
            <div>
                {tasks && tasks.map(task => 
                    <Task
                        key={task.id}
                        title={task.title}
                        icon={ICONS[task.icon].icon}
                        status={task.status}
                        onDelete={() => handleDeleteTask(task.id)}
                        onDone={() => changeTaskStatus(task.id)}
                    />
                )}
            </div>
        </div>
    )
}