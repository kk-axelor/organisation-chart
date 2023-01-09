import React, { useState, useEffect } from "react";
import OrgChartEditor from "./components/OrgChartEditor";

const getParams = () => {
  const params = new URL(document.location).searchParams;
  return {
    id: params.get("id"),
  };
};

function App() {
  const [parameters, setParameters] = useState({});

  useEffect(() => {
    setParameters(getParams());
  }, []);

  return (
    <section className="dhx-container">
      <OrgChartEditor parameters={parameters} />
    </section>
  );
}

export default App;
