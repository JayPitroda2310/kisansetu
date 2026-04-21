import { useEffect, useState } from 'react';

interface StatItem {
  target: number;
  label: string;
  prefix?: string;
  suffix?: string;
}

const stats: StatItem[] = [
  { target: 10, label: 'Active Farmers', suffix: 'K+' },
  { target: 500, label: 'Equipment Available', suffix: '+' },
  { target: 25, label: 'States Covered', suffix: '+' },
  { target: 50, label: 'Farmer Earnings', prefix: '₹', suffix: 'Cr+' },
];

function useCounterAnimation(target: number, duration: number = 2000) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const increment = target / (duration / 16);
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [target, duration]);

  return count;
}

function StatCard({ stat }: { stat: StatItem }) {
  const count = useCounterAnimation(stat.target);

  return (
    <div className="text-center">
      <div className="font-['Fraunces',sans-serif] text-5xl text-[#64b900] mb-2">
        {stat.prefix}{count}{stat.suffix}
      </div>
      <div className="font-['Geologica:Regular',sans-serif] text-base lg:text-lg text-gray-700">
        {stat.label}
      </div>
    </div>
  );
}

export function StatsCounter() {
  return (
    <section className="py-12 lg:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {stats.map((stat, index) => (
            <StatCard key={index} stat={stat} />
          ))}
        </div>
      </div>
    </section>
  );
}