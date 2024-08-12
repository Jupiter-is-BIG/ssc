import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./Home";
import SubjectDetails from "./SubjectDetails";
import CourseDetails from "./CourseDetails";
import { BEProvider } from "./BEContext"; // Adjust the path if needed

function App() {
  return (
    // <BEProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path=":campus/:code/:session" element={<SubjectDetails />} />
          <Route
            path=":campus/:code/:session/:course"
            element={<CourseDetails />}
          />
        </Routes>
      </Router>
    // </BEProvider>
  );
}

export default App;
