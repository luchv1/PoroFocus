import { useState } from "react"

export default function Range({title, icon, max, currentValue, onChange, isActive}) {
    function handleChange(e) {
        const newValue = Number(e.target.value);
        onChange?.(newValue); // Notify parent of new value n
    }
    return (
        <div className="flex flex-col">
            <div className="flex justify-between flex-row gap-2 py-2">
                <div className="font-bold flex gap-2"> {icon}{title} </div>
                <div className="font-bold">{currentValue} min</div>
            </div>
            <input
                disabled={isActive}
                type="range"
                min="5"
                max={max}
                value={currentValue}
                className="range range-neutral w-full"
                onChange={handleChange}
            />
        </div>
    )
}