
import { CalendarDays, ChevronLeft, ChevronRight, Bell, Users } from "lucide-react";

function App() {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <aside className="fixed left-0 top-0 hidden h-screen w-64 bg-slate-900 p-6 text-white md:block">
        <h1 className="text-2xl font-bold">
          Shift<span className="text-blue-400">Mate</span>
        </h1>

        <p className="mt-2 text-sm text-slate-400">
          Employee Shift Management
        </p>

        <nav className="mt-10 space-y-3">
          <button className="flex w-full items-center gap-3 rounded-lg bg-blue-600 px-4 py-3 text-left">
            <CalendarDays size={20} />
            Shift Calendar
          </button>

          <button className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-slate-300 hover:bg-slate-800">
            <Users size={20} />
            Employees
          </button>
        </nav>
      </aside>

      <main className="md:ml-64">
        <header className="flex items-center justify-between border-b bg-white px-6 py-5 md:px-10">
          <div>
            <h2 className="text-xl font-bold">Shift Calendar</h2>
            <p className="mt-1 text-sm text-slate-500">
              Manage and view employee schedules
            </p>
          </div>

          <button
            aria-label="Notifications"
            className="rounded-xl border p-3 hover:bg-slate-50"
          >
            <Bell size={20} />
          </button>
        </header>

        <section className="p-6 md:p-10">
          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            <StatCard title="Total Shifts" value="--" />
            <StatCard title="Morning Shifts" value="--" />
            <StatCard title="Night Shifts" value="--" />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold">Monthly Schedule</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Your team at a glance
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  aria-label="Previous month"
                  className="rounded-lg border p-2 hover:bg-slate-100"
                >
                  <ChevronLeft size={20} />
                </button>

                <span className="min-w-32 text-center font-semibold">
                  October 2026
                </span>

                <button
                  aria-label="Next month"
                  className="rounded-lg border p-2 hover:bg-slate-100"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 border-l border-t border-slate-200">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                (day) => (
                  <div
                    key={day}
                    className="border-b border-r bg-slate-50 py-3 text-center text-xs font-semibold text-slate-500 sm:text-sm"
                  >
                    {day}
                  </div>
                )
              )}

              {Array.from({ length: 35 }, (_, index) => {
                const date = index - 3 + 1;
                const validDate = date >= 1 && date <= 31;

                return (
                  <div
                    key={index}
                    className="min-h-20 border-b border-r border-slate-200 p-2 sm:min-h-28"
                  >
                    {validDate && (
                      <span className="text-sm font-medium">{date}</span>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-5 flex flex-wrap gap-4 text-xs text-slate-600">
              <Legend color="bg-emerald-500" label="Morning" />
              <Legend color="bg-blue-500" label="Evening" />
              <Legend color="bg-violet-500" label="Night" />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{title}</p>
      <p className="mt-3 text-2xl font-bold">{value}</p>
    </div>
  );
}

function Legend({ color, label }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
      {label}
    </div>
  );
}

export default App;
