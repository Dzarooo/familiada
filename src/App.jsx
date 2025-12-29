import { HashRouter, Routes, Route } from "react-router-dom";
import User from "./components/User";
import Admin from "./components/Admin";

function App() {

  return (
    <HashRouter>
      <main>
        <Routes>
          <Route
            path="/"
            element={
              <User />
            }
          />
          <Route
            path="/admin"
            element={
              <Admin />
            }
          />
        </Routes>
      </main>
    </HashRouter>

  )
}

export default App
