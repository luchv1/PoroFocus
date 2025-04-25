import { useState } from "react";
import Button from "./Button";

export default function Tabs ({tabs, init}) {
    const btnClasses = "w-1/2 text-center rounded-sm cursor-pointer";
    const [activeTab, setActiveTab] = useState(init);
    return (
        <div className="w-96">
            <div className="container">
                <div className="w-full flex mx-auto flex-row menu bg-base-200 rounded-box">
                    {tabs.map((tab) =>
                        <Button
                            key={tab.key}
                            className={activeTab === tab.key ? `${btnClasses} bg-neutral text-amber-50` : btnClasses}
                            onClick={() => setActiveTab(tab.key)}
                        >
                            {tab.label}
                        </Button>
                    )}
                </div>
                <div className="container mt-3 p-4">
                    {tabs.map((tab) => 
                        activeTab === tab.key ? <div key={tab.key}>{tab.content}</div> : null
                    )}
                </div>
            </div>
        </div>
    )
}