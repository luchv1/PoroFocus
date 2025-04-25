
import { X } from "lucide-react"
import Button from "./Button"

export default function Task({title, icon, status, onDone, onDelete}) {
    const statusClasses = ` ${status ?  "bg-blue-100" : "" }`;
    return (
        <div className="flex m-2 items-center justify-between border-neutral-400 space-x-2 cursor-pointer"
            onClick={onDone}>
            <div className="flex gap-2">
                <input checked={status} readOnly type="checkbox" className="checkbox checkbox-neutral" />
                {icon}
                <span className="truncate w-52">{title}</span>
            </div>
            <Button onClick={onDelete} classes="btn btn-ghost hover:bg-gray-100"><X size={16}/></Button>
        </div>
    )
}