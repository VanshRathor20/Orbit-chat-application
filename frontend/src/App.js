import { Routes, Route } from "react-router-dom";
import Home from "./Pages/Home";
import ChatPage from "./Pages/ChatPage";
import "./App.css";
import { Toaster } from "./components/ui/toaster";

function App() {
  return (
    <>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/chat" element={<ChatPage />} />
        </Routes>
      </div>

      <Toaster />
    </>
  );
}

export default App;