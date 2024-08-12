import React from "react";
import { useParams, useLocation } from "react-router-dom";

function CourseDetails() {
  const { campus, code, session, course } = useParams();
  const location = useLocation();

  return (
    <div>
      <h1>Course Details:</h1>
      <p>Campus: {campus === "ubco" ? "UBC Okanagan" : "UBC Vancouver"}</p>
      <p>Course: {decodeURIComponent(course)}</p>
      <p>Session: {session}</p> {/* Display the session value */}
    </div>
  );
}

export default CourseDetails;
