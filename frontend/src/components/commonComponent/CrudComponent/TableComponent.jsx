import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaEdit, FaTrash, FaEye, FaTicketAlt } from "react-icons/fa";

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
const [currentPage, setCurrentPage] = useState(1);
const [itemsPerPage, setItemsPerPage] = useState(10);

const indexOfLastItem = currentPage * itemsPerPage;
const indexOfFirstItem = indexOfLastItem - itemsPerPage;

const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);

const totalPages = Math.ceil(data.length / itemsPerPage);

  return (
    <div className="bg-white p-5 rounded shadow-md w-full">
      <div className="flex items-center justify-between mb-4">
        {searchTerm !== undefined && setSearchTerm !== undefined && (
          <input
            type="text"
            placeholder={`Search ${title.toLowerCase()}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border px-3 py-2 rounded-xl w-1/3 border-black text-black"
          />
        )}
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
              currentItems.map((row, idx) => (
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

                  {showActionColumn && (
                    <td className="px-4 py-2 border text-center border-gray-200">
                      <div className="flex items-center justify-center gap-2">
                        {row.viewPath && (
                          <Link
                            to={row.viewPath}
                            className="text-green-600 hover:text-green-800"
                            title="View"
                          >
                            <FaEye />
                          </Link>
                        )}

                        {row.bookingPath && (
                          <Link
                            to={row.bookingPath}
                            className="text-purple-600 hover:text-purple-800"
                            title="View Bookings"
                          >
                            <FaTicketAlt />
                          </Link>
                        )}

                        {row.editPath && (
                          <Link
                            to={row.editPath}
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
        <div className="flex justify-between items-center mt-4">
          <div>
            <span className="ml-2 text-black">Items per page</span>

            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border px-2 py-1 text-black ms-2"
            >
              <option className="text-black" value={5}>
                5
              </option>
              <option className="text-black" value={10}>
                10
              </option>
              <option className="text-black" value={25}>
                25
              </option>
              <option className="text-black" value={50}>
                50
              </option>
              <option className="text-black" value={100}>
                100
              </option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="px-2 py-1 border text-black"
            >
              {"<<"}
            </button>

            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-2 py-1 border text-black"
            >
              {"<"}
            </button>

            {(() => {
              const pages = [];

              for (let i = 1; i <= totalPages; i++) {
                if (
                  i === 1 ||
                  i === totalPages ||
                  (i >= currentPage - 1 && i <= currentPage + 1)
                ) {
                  pages.push(
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i)}
                      className={`px-3 py-1 border text-black ${
                        currentPage === i ? "bg-blue-500 text-white" : ""
                      }`}
                    >
                      {i}
                    </button>,
                  );
                } else if (i === currentPage - 2 || i === currentPage + 2) {
                  pages.push(
                    <span key={i} className="px-2 text-black">
                      ...
                    </span>,
                  );
                }
              }

              return pages;
            })()}

            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="px-2 py-1 border text-black"
            >
              {">"}
            </button>

            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="px-2 py-1 border text-black"
            >
              {">>"}
            </button>
          </div>

          <div>
            {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, data.length)} of{" "}
            {data.length}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableComponent;
