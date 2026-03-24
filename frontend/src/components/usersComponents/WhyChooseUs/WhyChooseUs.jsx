import { motion } from "framer-motion";
import { cn } from "../../../lib/utils"; // utility from Aceternity for classnames

const features = [
  {
    title: "Luxury at Sea",
    description:
      "Experience 5-star comfort, dining, and relaxation with every voyage.",
    icon: "🚢",
  },
  {
    title: "Instant Orders",
    description: "Order catering and items instantly with your voyager ID.",
    icon: "⚡",
  },
  {
    title: "Easy Bookings",
    description:
      "Reserve Movie Tickets, Spa, Fitness & Party Halls in one click.",
    icon: "🎟️",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="w-full py-16 px-4 md:px-20">
      <h2 className="text-4xl font-bold text-center mb-12">Why Choose Us</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {features.map((feature, idx) => (
          <motion.div
            key={idx}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "relative p-6 rounded-2xl border border-white/10 shadow-lg backdrop-blur-lg",
              "transition-all duration-300 group hover:shadow-[0_0_30px_#00ffff33]"
            )}
          >
            <div className="text-5xl mb-4">{feature.icon}</div>
            <h3 className="text-2xl font-semibold mb-2">{feature.title}</h3>
            <p className="text-sm opacity-80">{feature.description}</p>
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
              <div className="w-full h-full bg-gradient-to-br from-cyan-400 via-indigo-400 to-purple-400 rounded-2xl blur-lg" />
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
