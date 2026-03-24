import React, { useState } from "react";

const faqs = [
  {
    question:
"How does the Online Streaming work?",
    answer:
      "It cannot get easier Follow the steps listed below and you are all set(1) Book the tickets for the show of your choice.",
  },
  
];

const FAQAccordion = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleAccordion = (index) => {
    setActiveIndex(index === activeIndex ? null : index);
  };

  return (
    <section className="py-16 px-4 md:px-16">
      <div className="rounded-3xl bg-white/10 shadow-2xl backdrop-blur-md border border-white/20 p-6">
        <h2 className="text-3xl font-bold text-center mb-8">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-gray-300 rounded-lg p-4 bg-white shadow-sm"
            >
              <button
                onClick={() => toggleAccordion(index)}
                className="flex justify-between w-full text-left font-medium text-gray-800"
              >
                {faq.question}
                <span>{activeIndex === index ? "-" : "+"}</span>
              </button>
              {activeIndex === index && (
                <p className="mt-2 text-gray-600">{faq.answer}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQAccordion;
