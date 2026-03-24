import React from "react";

const DynamicForm = ({ fields, onSubmit, submitText = "Submit" }) => {
  const [formData, setFormData] = React.useState(() =>
    fields.reduce((acc, field) => {
      acc[field.name] = field.value || "";
      return acc;
    }, {})
  );

  const handleChange = (e) => {
    const { name, type, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "file" ? files[0] : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full h-full bg-white p-10 border border-gray-200 rounded-xl shadow"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {fields.map((field) => (
          <div
            key={field.name}
            className={`flex flex-col ${
              field.type === "textarea" ? "md:col-span-2" : ""
            }`}
          >
            <label className="mb-1 text-sm font-semibold text-gray-700">
              {field.label}
            </label>

            {field.type === "select" ? (
              <select
                name={field.name}
                value={formData[field.name]}
                onChange={handleChange}
                className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring text-black"
              >
                <option value="">Select {field.label}</option>
                {field.options?.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            ) : field.type === "textarea" ? (
              <textarea
                name={field.name}
                value={formData[field.name]}
                onChange={handleChange}
                placeholder={field.placeholder || ""}
                className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring text-black"
                rows={field.rows || 4}
              />
            ) : field.type === "file" ? (
              <div key={field.name} className="flex flex-col">
                {/* <label className="mb-1 text-sm font-semibold text-gray-700">
                  {field.label}
                </label> */}
                <input
                  type="file"
                  name={field.name}
                  accept="image/*"
                  onChange={handleChange}
                  className="block text-sm text-gray-700"
                />
              </div>
            ) : (
              <input
                type={field.type || "text"}
                name={field.name}
                value={formData[field.name]}
                onChange={handleChange}
                placeholder={field.placeholder || ""}
                readOnly={field.readOnly || false}
                className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring text-black"
              />
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg cursor-pointer"
        >
          {submitText}
        </button>
      </div>
    </form>
  );
};

export default DynamicForm;
