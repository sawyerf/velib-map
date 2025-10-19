import React from "react";
import "../styles/Heatmap.css";

const Heatmap = ({ data }) => {
  const [dates, setDates] = React.useState([]);
  const [maxValue, setMaxValue] = React.useState(1);

  React.useEffect(() => {
    if (!data || Object.keys(data).length === 0) return;
    const today = new Date();
    const days = 7 * 40 - (7 - today.getDay()) % 7;
    // Génère un tableau de 365 jours
    const newDates = Array.from({ length: days }).map((_, i) => {
      const date = new Date();
      date.setDate(today.getDate() - (days - 1 - i));
      const key = date.toISOString().split("T")[0];
      return {
        date: key,
        value: data[key] || 0,
      };
    });
    setDates(newDates);
    setMaxValue(Math.max(...newDates.map(d => d.value), 1));
  }, [data]);

  return (
    <div className="heatmap-container">
      {dates.map((day, wi) => (
        <div
          key={day.date}
          title={`${day.date} — ${day.value} trajets`}
          className={`day-cell`}
          style={{
            backgroundColor: !day.value ? "#dcdee0ff" : `rgba(0, 128, 0, ${day.value / maxValue})`,
          }}
        />
      ))}
    </div>
  );
};

export default Heatmap;