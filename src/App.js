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
  const [isLogin, setIsLogin] = useState(false)

  useEffect(() => {
    setParameters(getParams());
  }, []);



  useEffect(() => {
    const login = async () => {
      try {
        const response = await fetch("/axelor-erp/callback", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ username: "admin", password: "admin" })
        });

        const csrf = response.headers.get("x-csrf-token");
        document.cookie = `X-Csrf-Token=${csrf}`
        return true
      } catch (error) {
        return false;
      }
    };

    const handleLogin = async () => {
      const loginStatus = await login();
      setIsLogin(loginStatus)
    }
    handleLogin();

  }, [])

  console.log(isLogin)
  return (
    <section className="dhx-container">
      {
        isLogin ?
          <OrgChartEditor parameters={parameters} /> : "Login..."
      }
    </section>
  );
}

export default App;
