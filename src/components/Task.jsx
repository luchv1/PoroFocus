
import { X } from "lucide-react"
import Button from "./Button"

const classAnimation = "transition-transform duration-300 hover:bg-gray-100 hover:scale-105";
export default function Task({ title, icon, status, onDone, onDelete, isFocusMode }) {
    const titleClasses = ` ${status ? "truncate w-52 line-through" : "truncate w-52" }`;
    const blockClasses = ` ${status ? "bg-gray-100" : "bg-white"}`;
    if (isFocusMode && status) {
        return null;
    }
    return (
        <div className={`text-left flex mt-2 items-center justify-between
            border rounded-lg p-3 border-neutral space-x-2 cursor-pointer ${blockClasses} ${classAnimation}`}
            onClick={onDone}>
            <div className="flex gap-2 items-center justify-center text-center">
                {!isFocusMode && <input checked={status} readOnly type="checkbox" className="checkbox checkbox-neutral" />}
                {icon}
                <span className={titleClasses}>{title}</span>
            </div>
            {!isFocusMode && <Button onClick={onDelete} classes="hover:bg-gray-100 hover:scale-120"><X size={16} /></Button>}
        </div>
    )
}
