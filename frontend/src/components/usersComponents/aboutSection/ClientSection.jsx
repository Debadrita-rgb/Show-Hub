import React from "react";

const ClientSection = () => {
  return (
    <section className="px-4 sm:px-6 md:px-16 py-8 sm:py-12 md:py-16">
      <div className="rounded-3xl bg-white/10 shadow-2xl backdrop-blur-md border border-white/20 p-4 sm:p-6">
        <div className="client-section px-4 sm:px-10 md:px-16 py-6 sm:py-8 md:py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="md:w-1/2">
            <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-4">
              We are close to our clients
            </h2>
            <p className="text-white mb-4">
              Our Ship Management Centre (SMC) Managing Directors (MD) are your
              first point of contact right at your door in 11 different
              locations around the world.
            </p>
            <p className="text-white mb-4">
              We have a truly unique and international management structure with
              the C-suite in main shipping locations hence customers will always
              be able to talk to a senior member of management regardless of
              location.
            </p>
            <p className="text-white">
              Please don't hesitate to reach out to us; we'd love to hear from
              you because your opinions and feedback matter!
            </p>
          </div>
          <div className="md:w-1/2">
            <img
              src="https://wallpapers.com/images/featured/cruise-ship-48fv0tg5inbcobk9.jpg"
              alt="Container Ship"
              className="w-full rounded shadow-md"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ClientSection;
