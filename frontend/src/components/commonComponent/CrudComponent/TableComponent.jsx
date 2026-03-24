// components/TableComponent.jsx
import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaEdit, FaTrash, FaEye } from "react-icons/fa";

const TableComponent = ({
  title,
  columns,
  data,
  searchTerm,
  setSearchTerm,
  addPath,
  handleToggleActive,
  handleToggleRecommended,
  handleDelete,
  showAddButton = true,
  showActiveColumn = true,
  showActionColumn = true,
  showRecommendedeColumn = true,
  showDeleteButton = true,
}) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white p-5 rounded shadow-md w-full">
      <div className="flex items-center justify-between mb-4">
        {/* Search */}
        {searchTerm !== undefined && setSearchTerm !== undefined && (
          <input
            type="text"
            placeholder={`Search ${title.toLowerCase()}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border px-3 py-2 rounded-xl w-1/3 border-black text-black"
          />
        )}
        {/* Add Button */}
        {showAddButton && (
          <button
            onClick={() => navigate(addPath)}
            className="hover:bg-blue-700 text-white px-4 py-2 rounded-xl cursor-pointer"
            style={{ backgroundColor: "#1b4c6d" }}
          >
            + Add {title}
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 ">
          <thead className="text-white" style={{ backgroundColor: "#1b4c6d" }}>
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className="px-4 py-2 border border-gray-200">
                  {col}
                </th>
              ))}
              {showActiveColumn && (
                <th className="px-4 py-2 border border-gray-200">Active</th>
              )}
              {showRecommendedeColumn && (
                <th className="px-4 py-2 border border-gray-200">
                  Recommended
                </th>
              )}
              {showActionColumn && (
                <th className="px-4 py-2 border border-gray-200">Action</th>
              )}
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((row, idx) => (
                <tr key={idx} className="border-t hover:bg-gray-100">
                  {columns.map((col, cIdx) => (
                    <td
                      key={cIdx}
                      className="px-4 py-2 border text-gray-500 border-gray-200"
                    >
                      {row[col] ?? "--"}
                    </td>
                  ))}
                  {showActiveColumn && (
                    <td className="px-4 py-2 text-center border border-gray-200">
                      <input
                        type="checkbox"
                        checked={row.isActive}
                        onChange={() =>
                          handleToggleActive(row.id, !row.isActive)
                        }
                        className="form-radio text-blue-600"
                      />
                    </td>
                  )}

                  {/* Recommended Column */}

                  {showRecommendedeColumn && (
                    <td className="px-4 py-2 text-center border border-gray-200">
                      <input
                        type="checkbox"
                        checked={row.isRecommended}
                        onChange={() =>
                          handleToggleRecommended(row.id, !row.isRecommended)
                        }
                        className="form-radio text-blue-600"
                      />
                    </td>
                  )}

                  {/* Action column (last column) */}
                  {showActionColumn && (
                    <td className="px-4 py-2 border text-center border-gray-200">
                      <div className="flex items-center justify-center gap-1">
                        {row.viewPath ? (
                          <Link
                            to={row.viewPath}
                            className="text-green-600 hover:text-green-800"
                            title="View"
                          >
                            <FaEye />
                          </Link>
                        ) : (
                          <>
                            {row.editPath && (
                              <Link
                                to={`${row.editPath || `/edit/${row.id}`}`}
                                className="text-blue-600 hover:text-blue-800"
                                title="Edit"
                              >
                                <FaEdit />
                              </Link>
                            )}
                            {showDeleteButton && handleDelete && (

                            <button
                              onClick={() => handleDelete(row.id)}
                              className="text-red-600 hover:text-red-800 cursor-pointer"
                              title="Delete"
                            >
                              <FaTrash />
                            </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={
                    columns.length +
                    (showActiveColumn ? 1 : 0) +
                    (showActionColumn ? 1 : 0)
                  }
                  className="text-center py-4 text-gray-500"
                >
                  No data found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TableComponent;
