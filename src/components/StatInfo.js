import "../styles/StatInfo.css";

const StatInfo = ({ name, value, unit }) => {
  return (
    <div className="stat-info">
      <h2>{name}</h2>
      <p>{value} {unit}</p>
    </div>
  );
}

export default StatInfo;