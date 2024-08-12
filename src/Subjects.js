import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import { Link } from "react-router-dom";

function Subjects(props) {
  const [subjects, setSubjects] = useState([]);
  const csvFilePath = `${process.env.PUBLIC_URL}/csv_files/${props.campus}.csv`;

  useEffect(() => {
    fetch(csvFilePath)
      .then((response) => response.text())
      .then((data) => {
        const parsedData = Papa.parse(data, { header: true });
        setSubjects(parsedData.data);
      });
  }, [csvFilePath]);

  return (
    <div className="vancouver-subjects-table p-6">
      <table className="min-w-full bg-white border border-gray-200">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-2 px-4 text-left font-semibold text-gray-700">
              Subject Code
            </th>
            <th className="py-2 px-4 text-left font-semibold text-gray-700">
              Subject Title
            </th>
            <th className="py-2 px-4 text-left font-semibold text-gray-700">
              Faculty / School
            </th>
          </tr>
        </thead>
        <tbody>
          {subjects.map((subject, index) => (
            <tr key={index} className="border-t border-gray-200">
              <td
                className={`py-2 px-4 ${
                  subject["Subject Code"] &&
                  subject["Subject Code"].includes("*")
                    ? "font-bold text-gray-800"
                    : "text-gray-600"
                }`}
              >
                <Link
                  to={`${props.campus}/${encodeURIComponent(
                    subject["Subject Code"]
                  )}/${props.session}`}
                  className="text-blue-500 hover:underline"
                >
                  {subject["Subject Code"] || "N/A"}
                </Link>
              </td>
              <td className="py-2 px-4 text-gray-600">
                {subject["Subject Title"] || "N/A"}
              </td>
              <td className="py-2 px-4 text-gray-600">
                {subject["Faculty / School"] || "N/A"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Subjects;
