import React from 'react'
const cardData = [
  {
    title: "Voyager-Centric Design",
    description:
      "Voyagers can log in and easily access catering, stationery, ticket bookings, salon, fitness center, and party hall reservations.",
    image:
      "https://media.gettyimages.com/id/682650811/photo/old-san-juan-cruise-boats-in-the-port.jpg?s=612x612&w=gi&k=20&c=THhE0oD9EXwKUmuaW7d5gtsev2rzN_C3R0FEwYT2QKQ=",
    alt: "Voyager Booking",
  },
  {
    title: "Efficient Department Coordination",
    description:
      "Orders are routed to the Head Chef or Supervisor automatically, reducing delays and ensuring timely service.",
    image:
      "https://www.jobonship.org/uploads/9/8/7/1/9871060/cruise-staff_orig.jpg",
    alt: "Efficient Coordination",
  },
  {
    title: "Booking Reimagined",
    description:
      "Whether it's movies, fitness slots, or themed parties — voyagers can book with ease and view real-time availability.",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRBHb3dDVahyMXWEETd1KeYZ1zQ0Q-46854ng&s",
    alt: "Booking Reimagined",
  },
];

const promiseSection = () => {
  return (
    <section className="px-6 md:px-16 py-16">
      <div
        className="py-16 px-4 text-center rounded-3xl"
        style={{ backgroundColor: "#335A74" }}
      >
        <div className="max-w-4xl mx-auto mb-12">
          <p className="text-sm uppercase text-white tracking-wider">
            Our Promise
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 mt-3">
            Simplifying Cruise Ship Operations for a Seamless Voyager Experience
          </h2>
          <p className="text-white text-lg">
            We aim to enhance the cruise experience by addressing the
            inefficiencies of traditional systems. Our platform allows voyagers
            to easily place orders, make bookings, and enjoy their journey —
            while ensuring smooth coordination between departments and quick
            service delivery.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Card 1 */}
          {cardData.map((card, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              <img
                src={card.image}
                alt={card.alt}
                className="w-full h-56 object-cover rounded-xl shadow-md"
              />
              <h3 className="text-xl font-semibold mt-4 text-white">
                {card.title}
              </h3>
              <p className="text-white mt-2">{card.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default promiseSection
