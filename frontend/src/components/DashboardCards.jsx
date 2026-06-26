import { motion } from "framer-motion";

const cards = [
  { title: "AI Detection", subtitle: "Scan threats quickly", value: "Detect now" },
  { title: "SOS Emergency", subtitle: "Send instant alerts", value: "Activate SOS" },
  { title: "Safe Route", subtitle: "Navigate safely", value: "Find route" },
  { title: "Nearby Services", subtitle: "Police, hospitals", value: "Locate now" },
  { title: "Chat Assistant", subtitle: "Get safety advice", value: "Chat now" },
  { title: "Emergency Sound", subtitle: "Fake alarm & alert", value: "Trigger" },
];

const DashboardCards = () => (
  <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
    {cards.map((card) => (
      <motion.div
        key={card.title}
        whileHover={{ y: -6 }}
        className="rounded-[32px] bg-white/80 p-6 shadow-glass backdrop-blur transition duration-300"
      >
        <span className="text-sm font-semibold uppercase tracking-[0.2em] text-secondary">
          {card.title}
        </span>
        <h3 className="mt-4 text-2xl font-semibold text-slate-900">{card.value}</h3>
        <p className="mt-2 text-sm text-slate-500">{card.subtitle}</p>
      </motion.div>
    ))}
  </div>
);

export default DashboardCards;
