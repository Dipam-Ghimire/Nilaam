import { useState, useEffect } from 'react';

function calculateTimeLeft(targetDate) {
  if (!targetDate) return null;

  const target = new Date(targetDate);

  if (Number.isNaN(target.getTime())) {
    return null;
  }

  const difference =
    target.getTime() - Date.now();

  if (difference <= 0) {
    return null;
  }

  return {
    days: Math.floor(
      difference /
        (1000 * 60 * 60 * 24)
    ),

    hours: Math.floor(
      (difference /
        (1000 * 60 * 60)) %
        24
    ),

    minutes: Math.floor(
      (difference /
        (1000 * 60)) %
        60
    ),

    seconds: Math.floor(
      (difference / 1000) % 60
    ),
  };
}

function CountdownTimer({
  endTime,
  label,
}) {
  const [timeLeft, setTimeLeft] =
    useState(() =>
      calculateTimeLeft(endTime)
    );

  useEffect(() => {

    setTimeLeft(
      calculateTimeLeft(endTime)
    );

    const timer = setInterval(() => {

      setTimeLeft(
        calculateTimeLeft(endTime)
      );

    }, 1000);

    return () => clearInterval(timer);

  }, [endTime]);

  if (!timeLeft) {

    return (
      <span className="text-slate-500 font-medium text-sm">
        Ended
      </span>
    );

  }

  return (
    <span className="font-mono text-sm font-bold text-yellow-600">
      {label
        ? `${label}: `
        : ''}

      {timeLeft.days > 0 &&
        `${timeLeft.days}d `}

      {String(
        timeLeft.hours
      ).padStart(2, '0')}
      h{' '}

      {String(
        timeLeft.minutes
      ).padStart(2, '0')}
      m{' '}

      {String(
        timeLeft.seconds
      ).padStart(2, '0')}
      s
    </span>
  );
}

export default CountdownTimer;