// App.jsx
import React from "react";

import "./styles/App.css";
import Stats from "./components/Stats";

function App() {
  const [walletOperations, setWalletOperations] = React.useState([]);
  const [typeVelib, setTypeVelib] = React.useState("ALL");
  const [startDate, setStartDate] = React.useState(null);
  const [endDate, setEndDate] = React.useState(null);

  document.body.ondrop = (event) => {
    handleFileChange(event);
  };

  document.body.ondragover = (event) => {
    event.preventDefault();
  };

  const handleFileChange = (event) => {
    event.preventDefault();
    let file = null;

    if (event?.target?.files?.length > 0) {
      file = event.target.files[0];
    } else if (event?.dataTransfer?.files?.length > 0) {
      file = event.dataTransfer.files[0];
    } else {
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result);
        setWalletOperations(
          json.walletOperations.filter(op => op.parameter3.DISTANCE !== '0.0' &&
            op.parameter3.departureStationId !== op.parameter3.arrivalStationId)
        );
      } catch (error) {
        console.error("Invalid JSON file", error);
      }
    }
    reader.readAsText(file);
  }

  return (
    <div className="main-container">
      <h1>Statistiques Vélib</h1>
      <a id="github" href="https://github.com/sawyerf/velib-map" target="_blank" rel="noreferrer">
        <img src="./github.svg" alt="GitHub" width="32" height="32" />
      </a>
      {
        walletOperations.length === 0 && (
          <div className="tuto">
            <p><a href="https://www.velib-metropole.fr/login" target="_blank" rel="noreferrer">Connectez-vous</a> à votre compte Vélib</p>
            <p>Cliquez sur "Télecharger vos trajets" en dessous</p>
            <p>Enregistrez le fichier JSON.</p>
            <p>Importez le fichier.</p>
          </div>
        )
      }
      <div className="buttons" style={{ marginTop: "10px" }}>
        <a className="download" href="https://www.velib-metropole.fr/api/private/getCourseList?limit=100000" target="_blank" rel="noreferrer">Télécharger vos trajets (JSON)</a>
        <input type="file" accept=".json" onChange={handleFileChange} />
      </div>
      {
        walletOperations?.length > 0 &&
        <>
          <div className="buttons">
            <button id="all" onClick={() => setTypeVelib("ALL")} disabled={typeVelib === "ALL"}>Tout</button>
            <button id="mechanical" onClick={() => setTypeVelib("MECHANICAL")} disabled={typeVelib === "MECHANICAL"}>Mécanique</button>
            <button id="electric" onClick={() => setTypeVelib("ELECTRIC")} disabled={typeVelib === "ELECTRIC"}>Électrique</button>
          </div>
          <div className="buttons">
            <input type="date" value={startDate || ""} onChange={(e) => setStartDate(e.target.value)} />
            →
            <input type="date" value={endDate || ""} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          {
            (startDate || endDate) && (
              <div className="buttons">
                <button onClick={() => {
                  setStartDate(null);
                  setEndDate(null);
                }}>Réinitialiser</button>
              </div>
            )
          }
        </>
      }
      <Stats
        walletOperations={walletOperations}
        typeVelib={typeVelib}
        startDate={startDate}
        endDate={endDate}
        setStartDate={setStartDate}
        setEndDate={setEndDate}
      />
    </div>
  );
}

export default App;
