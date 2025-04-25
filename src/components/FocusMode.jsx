import { X }  from "lucide-react"
import { useEffect } from "react";

export default function FocusMode({ isOpen, onClose, timeDisplay }) {
    useEffect(() => {
        const handleEscKey = (event) => {
            if (isOpen && event.key === "Escape") {
                onClose();
            }
        };
        document.addEventListener('keydown', handleEscKey);

        return () => {
            document.removeEventListener('keydown', handleEscKey);
        };
        }, [isOpen, onClose]);

        const tasks = "";
        if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-50">
            <div className="container mx-auto px-4 flex flex-col items-center">
                {/* Exit button */}
                <button
                    onClick={onClose}
                    className="btn btn-ghost border-transparent hover:shadow-none
                    text-neutral-500 absolute top-4 right-4 hover:text-neutral hover:bg-transparent"
                >
                    <X size={20} />
                </button>
                {/* Display time */}
                <div className="text-9xl font-bold mb-6">
                    {timeDisplay}
                </div>

                {/* Display task */}
                <div className="text-2xl mb-12 text-center max-w-2xl">
                    {tasks && tasks.map(task =>
                        <span>task.title</span>
                    )}
                </div>
            </div>
        </div>
    );
};
