import React from "react";
import { FiCalendar } from "react-icons/fi";

const upcomingEvents = [
  {
    id: 1,
    title: "Team Meeting",
    date: "2024-02-25",
    time: "10:00 AM",
  },
  {
    id: 2,
    title: "Product Launch",
    date: "2024-02-28",
    time: "2:00 PM",
  },
  {
    id: 3,
    title: "Client Presentation",
    date: "2024-03-01",
    time: "11:00 AM",
  },
];

const UpcomingEvents: React.FC = () => {
  return (
    <div className="bg-white dark:bg-[#0B0F2E] rounded-2xl shadow-sm p-6">
      <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
        Upcoming Events
      </h2>
      <div className="space-y-4">
        {upcomingEvents.map((event) => (
          <div
            key={event.id}
            className="flex items-center justify-between py-3 border-b border-slate-200 dark:border-white/10 last:border-0"
          >
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/[0.04] flex items-center justify-center">
                <FiCalendar className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  {event.title}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {event.date} at {event.time}
                </p>
              </div>
            </div>
            <button className="text-sm text-[#0F5BBD] hover:text-[#0F5BBD]/90">
              Add to Calendar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UpcomingEvents;