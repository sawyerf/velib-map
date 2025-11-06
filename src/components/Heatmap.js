import React from "react";
import "../styles/Heatmap.css";

const Heatmap = ({ data, onClick = () => {} }) => {
  const [dates, setDates] = React.useState([]);
  const [maxValue, setMaxValue] = React.useState(1);

  const generateDates = () => {
    const nbColumns = Math.floor(Math.min(document.documentElement.clientWidth  - 40, 800) / (12 + 4)); // 12px width + 4px margin
    if (!data || Object.keys(data).length === 0) return;
    const today = new Date();
    const days = 7 * nbColumns - (7 - today.getDay()) % 7;
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
  };

  React.useEffect(() => {
    generateDates();
    const handleResize = () => {
      generateDates();
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [data]);

  return (
    <div className="heatmap-container">
      {dates.map((day, wi) => (
        <div
          key={day.date}
          onClick={() => onClick(day.date)}
          title={`${day.value} trajet(s) le ${new Date(day.date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`}
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