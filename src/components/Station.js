import "../styles/Station.css";

const Station = ({ name, hits }) => {
  return (
    <div className="station">
      <h3>{name}</h3>
      <p>{hits} passages</p>
    </div>
  );
};

export default Station;
      