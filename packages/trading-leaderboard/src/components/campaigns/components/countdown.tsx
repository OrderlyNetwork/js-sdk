import { FC, useState, useEffect } from "react";
import { CampaignConfig } from "../type";

const Circle = () => (
  <div className="oui-w-1 oui-h-1 oui-rounded-full oui-bg-white/[0.16]" />
);

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface TimeUnitProps {
  value: number;
  label: string;
}

const TimeUnit: FC<TimeUnitProps> = ({ value, label }) => (
  <div className="oui-flex oui-flex-col oui-items-center oui-gap-1 oui-w-[63px]">
    <div className="oui-trading-leaderboard-title oui-text-base-contrast oui-font-medium oui-text-[36px] oui-leading-[44px] oui-h-[44px]">
      {value.toString().padStart(2, "0")}
    </div>
    <div className="oui-trading-leaderboard-title oui-text-base-contrast-80 oui-text-sm oui-font-medium">
      {label}
    </div>
  </div>
);

export const CampaignsCountdown: FC<{ campaign: CampaignConfig }> = ({
  campaign,
}) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isStarted, setIsStarted] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const currentTime = new Date().getTime();
      const startTime = new Date(campaign.start_time).getTime();
      const endTime = new Date(campaign.end_time).getTime();

      // Determine if campaign has started
      const hasStarted = currentTime >= startTime;
      setIsStarted(hasStarted);

      // Calculate time difference based on campaign status
      const targetTime = hasStarted ? endTime : startTime;
      const difference = targetTime - currentTime;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
        );
        const minutes = Math.floor(
          (difference % (1000 * 60 * 60)) / (1000 * 60),
        );
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    // Calculate immediately
    calculateTimeLeft();

    // Set up interval to update every second
    const timer = setInterval(calculateTimeLeft, 1000);

    // Cleanup interval on component unmount
    return () => clearInterval(timer);
  }, [campaign.start_time, campaign.end_time]);

  // Check if campaign has ended
  const currentTime = new Date();
  const endTime = new Date(campaign.end_time);

  if (currentTime > endTime) {
    return (
      <div className="oui-w-full oui-flex oui-items-center oui-justify-center oui-gap-4">
        <div
          className="oui-max-w-[382px] oui-w-full oui-h-[1px] oui-bg-gradient-to-r oui-from-[rgba(var(--oui-gradient-brand-end)/0)]
        oui-to-[rgba(var(--oui-gradient-brand-start))]"
        />
        <div className="oui-trading-leaderboard-title oui-flex oui-items-center oui-justify-center oui-p-5 oui-text-base-contrast-54 oui-text-[18px] oui-leading-[26px] oui-font-medium oui-whitespace-nowrap">
          Battle has ended
        </div>
        <div
          className="oui-max-w-[382px] oui-w-full oui-h-[1px] oui-bg-gradient-to-r oui-from-[rgba(var(--oui-gradient-brand-start))]
        oui-to-[rgba(var(--oui-gradient-brand-end)/0)]"
        />
      </div>
    );
  }

  const titleText = isStarted ? "Battle ends in" : "Battle starts in";

  // Time units configuration
  const timeUnits = [
    { value: timeLeft.days, label: "Days" },
    { value: timeLeft.hours, label: "Hours" },
    { value: timeLeft.minutes, label: "Minutes" },
    { value: timeLeft.seconds, label: "Seconds" },
  ];

  return (
    <div className="oui-w-full oui-flex oui-items-center oui-justify-center oui-gap-4">
      <div
        className="oui-max-w-[298px] oui-w-full oui-h-[1px] oui-bg-gradient-to-r oui-from-[rgba(var(--oui-gradient-brand-end)/0)]
        oui-to-[rgba(var(--oui-gradient-brand-start))]"
      />
      <div className="oui-flex oui-flex-col oui-items-center oui-p-5 oui-gap-2">
        <div className="oui-trading-leaderboard-title oui-text-base-contrast-54 oui-text-[18px] oui-leading-[26px] oui-h-[26px] oui-font-medium">
          {titleText}
        </div>
        <div className="oui-flex oui-items-center oui-gap-[10px]">
          {timeUnits.map((unit, index) => (
            <div
              key={unit.label}
              className="oui-flex oui-items-center oui-gap-[10px]"
            >
              <TimeUnit value={unit.value} label={unit.label} />
              {index < timeUnits.length - 1 && <Circle />}
            </div>
          ))}
        </div>
      </div>
      <div
        className="oui-max-w-[298px] oui-w-full oui-h-[1px] oui-bg-gradient-to-r oui-from-[rgba(var(--oui-gradient-brand-start))]
        oui-to-[rgba(var(--oui-gradient-brand-end)/0)]"
      />
    </div>
  );
};
