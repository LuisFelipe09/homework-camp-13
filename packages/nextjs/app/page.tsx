import { CounterDisplay } from "~~/components/CounterDisplay";
import { CounterIncrement } from "~~/components/CounterIncrement";
import { CounterDecrease } from "~~/components/CounterDecrease";
import { CounterSet } from "~~/components/CounterSet";
import { CounterReset } from "~~/components/CounterReset";

const Home = () => {
  return (
    <div className="flex items-center flex-col grow pt-10">
      <div className="px-5">
        <h1 className="text-center">
          <span className="block text-2xl mb-2">Welcome to</span>
          <span className="block text-4xl font-bold">Scaffold-Stark 2</span>
        </h1>

        {/* Counter Components */}
        <div className="w-full max-w-md mt-8 mx-auto space-y-6">
          <CounterDisplay />
          <div className="grid grid-cols-2 gap-4">
            <CounterIncrement />
            <CounterDecrease />
          </div>
          <CounterSet />
          <CounterReset />
        </div>
      </div>
    </div>
  );
};

export default Home;
