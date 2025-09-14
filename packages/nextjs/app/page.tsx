import { CounterDisplay } from "~~/components/CounterDisplay";
import { CounterIncrement } from "~~/components/CounterIncrement";
import { CounterDecrease } from "~~/components/CounterDecrease";
import { CounterSet } from "~~/components/CounterSet";
import { CounterReset } from "~~/components/CounterReset";
import { EventReader } from "~~/components/EventReader";

const Home = () => {
  return (
    <div className="w-full grow pt-10 px-5 flex flex-col items-center">
      {/* Row 1: Counter Card */}
      <div className="w-full max-w-3xl mb-10">
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
      {/* Row 2: Events */}
      <div className="w-full max-w-4xl">
        <EventReader />
      </div>
    </div>
  );
};

export default Home;
