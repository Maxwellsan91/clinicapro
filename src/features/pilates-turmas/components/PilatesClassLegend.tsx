import { FREQUENCY_LABELS, FREQUENCY_STYLES, type PilatesFrequency } from "../schema";

export function PilatesClassLegend() {
  const items: Array<PilatesFrequency | "vacant"> = [
    "once_week",
    "twice_week",
    "three_times_week",
    "trial",
    "vacant",
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item}
          className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-medium ${FREQUENCY_STYLES[item]}`}
        >
          {item === "vacant" ? "VAGA" : FREQUENCY_LABELS[item]}
        </span>
      ))}
    </div>
  );
}
