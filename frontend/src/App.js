import { Routes, Route } from "react-router-dom";
import Home from "./Pages/Home";
import ChatPage from "./Pages/ChatPage";
import "./App.css";
import { Toaster } from "./components/ui/toaster";

function App() {
  return (
    <>
      <div className="App">
        <div className="watermark-bg" style={{ backgroundImage: 'radial-gradient(circle, rgba(254, 99, 6, 0.18) 0%, rgba(254, 99, 6, 0) 70%), url("/orbit_favicon-removebg-preview.png")' }}></div>
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