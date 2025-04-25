
import { X } from "lucide-react"
import Button from "./Button"

export default function TodoIcon({title, icon, status, onDone, onDelete}) {
    const statusClasses = ` ${status ?  "bg-blue-100" : "" }`;
    return (
        <div className="flex items-center justify-between border-neutral-400 space-x-2 cursor-pointer"
            onClick={onDone}>
            <div className="flex gap-2">
                <input checked={status} readOnly type="checkbox" className="checkbox checkbox-neutral" />
                {icon}
                <span>{title}</span>
            </div>
            <Button onClick={onDelete} classes="btn btn-neural"><X /></Button>
        </div>
    )
}