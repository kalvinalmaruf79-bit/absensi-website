// src/components/ui/Tabs.jsx
"use client";
import { useState } from "react";

export default function Tabs({ tabs, defaultTab = 0, onChange }) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  const handleTabClick = (index) => {
    setActiveTab(index);
    if (onChange) onChange(index);
  };

  return (
    <div className="w-full">
      {/* Tab Headers */}
      <div className="border-b border-neutral-border">
        <div className="flex gap-1">
          {tabs.map((tab, index) => (
            <button
              key={index}
              onClick={() => handleTabClick(index)}
              className={`px-6 py-3 text-sm font-medium transition-all rounded-t-lg ${
                activeTab === index
                  ? "text-primary border-b-2 border-primary bg-primary/5"
                  : "text-neutral-secondary hover:text-neutral-text hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-2">
                {tab.icon && <span>{tab.icon}</span>}
                <span>{tab.label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="py-6">{tabs[activeTab]?.content}</div>
    </div>
  );
}
