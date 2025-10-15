import "./StatInfo.css";

const StatInfo = ({ name, value }) => {
  return (
    <div className="stat-info">
      <h2>{name}</h2>
      <p>{value}</p>
    </div>
  );
}

export default StatInfo;