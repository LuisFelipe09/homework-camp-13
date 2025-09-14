import { CounterDisplay } from "~~/components/CounterDisplay";
import { CounterIncrement } from "~~/components/CounterIncrement";
import { CounterDecrease } from "~~/components/CounterDecrease";
import { CounterSet } from "~~/components/CounterSet";
import { CounterReset } from "~~/components/CounterReset";
import { EventReader } from "~~/components/EventReader";

const Home = () => {
  return (
    <div className="w-full grow pt-10 px-5">
      <div className="max-w-7xl mx-auto grid gap-8 lg:gap-10 lg:grid-cols-5">
        {/* Left: Counter */}
        <div className="lg:col-span-3">
          <div className="card bg-base-200 shadow-xl border border-base-300">
            <div className="card-body items-center text-center">
              <h1 className="card-title text-2xl mb-4 text-base-content">Counter DApp</h1>
              <div className="mb-6">
                <div className="text-sm mb-2 text-base-content/70 font-medium tracking-wide uppercase">Current Value</div>
                <CounterDisplay />
              </div>
              <div className="flex gap-3 flex-wrap items-center justify-center mb-4">
                <CounterDecrease />
                <CounterIncrement />
                <CounterReset />
              </div>
              <div className="divider my-4 text-base-content/70">Owner Actions</div>
              <div className="flex justify-center">
                <CounterSet />
              </div>
            </div>
          </div>
        </div>
        {/* Right: Events */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <EventReader />
        </div>
      </div>
    </div>
  );
};

export default Home;
