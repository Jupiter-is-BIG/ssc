import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Papa from "papaparse";
import { Link } from "react-router-dom";

function SubjectDetails() {
  const { campus, code, session } = useParams();
  const s_code = decodeURIComponent(code);

  const [courses, setCourses] = useState([]);
  const [csvLoaded, setCsvLoaded] = useState(false);
  const csvFilePath =
    campus === "ubco"
      ? `${process.env.PUBLIC_URL}/csv_files/${s_code}_O.csv`
      : `${process.env.PUBLIC_URL}/csv_files/${s_code}_V.csv`;

  useEffect(() => {
    fetch(csvFilePath)
      .then((response) => {
        if (!response.ok) {
          throw new Error("CSV file not found");
        }
        return response.text();
      })
      .then((data) => {
        const parsedData = Papa.parse(data, { header: true });
        if (
          parsedData.data === null ||
          parsedData.data[0]["Course"] === undefined
        )
          return;
        setCourses(parsedData.data);
        setCsvLoaded(true);
      })
      .catch((error) => {
        console.error("Error loading CSV:", error);
        setCsvLoaded(false);
      });
  }, [csvFilePath]);

  return (
    <div>
      <h1>Subject Details</h1>
      <p>Campus: {campus === "ubco" ? "UBC Okanagan" : "UBC Vancouver"}</p>
      <p>Subject Code: {s_code}</p>

      {csvLoaded && courses.length > 0 && (
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 text-left font-semibold text-gray-700">
                Course
              </th>
              <th className="py-2 px-4 text-left font-semibold text-gray-700">
                Title
              </th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course, index) => (
              <tr key={index} className="border-t border-gray-200">
                <td className="py-2 px-4 text-gray-800">
                  <Link
                    to={`${encodeURIComponent(course["Course"])}`}
                    className="text-blue-500 hover:underline"
                  >
                    {course["Course"] || "N/A"}
                  </Link>
                </td>
                <td className="py-2 px-4 text-gray-600">
                  {course["Title"] || "N/A"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default SubjectDetails;
