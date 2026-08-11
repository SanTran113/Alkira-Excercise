// import { useState } from "react";
import { Routes, Route, HashRouter } from "react-router-dom";
import "./App.css";
import SignupPage from "./pages/SignupPage";

function App() {

  return (
    <>
      <HashRouter>
        <Routes>
          <Route path="/:signup?" element={<SignupPage />} />
        </Routes>
      </HashRouter>
    </>
  );
}

export default App;
