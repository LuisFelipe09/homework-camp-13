import { CounterDisplay } from "~~/components/CounterDisplay";
import { CounterIncrement } from "~~/components/CounterIncrement";
import { CounterDecrease } from "~~/components/CounterDecrease";
import { CounterSet } from "~~/components/CounterSet";
import { CounterReset } from "~~/components/CounterReset";

const Home = () => {
  return (
    <div className="flex items-center flex-col grow pt-10">
      <div className="px-5">
        {/* Counter Interface */}
        <div className="w-full max-w-2xl mt-8 mx-auto">
          <div className="card bg-base-200 shadow-xl border border-base-300">
            <div className="card-body items-center text-center">
              <h2 className="card-title text-2xl mb-6 text-base-content">Counter DApp</h2>

              {/* Counter Display */}
              <div className="mb-8">
                <div className="text-lg mb-2 text-base-content font-semibold">Current Value:</div>
                <CounterDisplay />
              </div>

              {/* Action Buttons Row */}
              <div className="flex gap-4 items-center justify-center mb-6">
                <CounterDecrease />
                <CounterIncrement />
                <CounterReset />
              </div>

              {/* Set Counter Section */}
              <div className="divider text-base-content">Owner Actions</div>
              <div className="flex justify-center">
                <CounterSet />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
