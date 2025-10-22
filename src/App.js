// App.jsx
import React from "react";

import "./styles/App.css";
import Stats from "./components/Stats";

function App() {
  const [walletOperations, setWalletOperations] = React.useState([]);
  const [typeVelib, setTypeVelib] = React.useState("ALL");

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
        setWalletOperations(json.walletOperations.filter(op => op.parameter3.DISTANCE !== '0.0'));
      } catch (error) {
        console.error("Invalid JSON file", error);
      }
    }
    reader.readAsText(file);
  }

  return (
    <div className="main-container" style={{ justifyContent: "center" }}>
      <h1>Statistiques Vélib</h1>
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
      <div style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "16px",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: "20px",
        marginTop: "10px",
      }}
      >
        <a className="download" href="https://www.velib-metropole.fr/api/private/getCourseList?limit=100000" target="_blank" rel="noreferrer">Télécharger vos trajets (JSON)</a>
        <input type="file" accept=".json" onChange={handleFileChange} />
      </div>
      {
        walletOperations?.length > 0 &&
        <div className="buttons">
          <button id="all" onClick={() => setTypeVelib("ALL")} disabled={typeVelib === "ALL"}>Tout</button>
          <button id="mechanical" onClick={() => setTypeVelib("MECHANICAL")} disabled={typeVelib === "MECHANICAL"}>Mécanique</button>
          <button id="electric" onClick={() => setTypeVelib("ELECTRIC")} disabled={typeVelib === "ELECTRIC"}>Électrique</button>
        </div>
      }
      <Stats walletOperations={walletOperations} typeVelib={typeVelib} />
    </div>
  );
}

export default App;
