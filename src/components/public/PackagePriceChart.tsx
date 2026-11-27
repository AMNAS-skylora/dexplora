import { getVisiblePriceCards } from "@/lib/package-price-cards";
import { formatPrice } from "@/lib/utils";
import { TrainFront, Users, User } from "lucide-react";

const themes = {
  green: { header: "from-[#4DAA13] to-[#00613F]", amount: "text-[#06452A]" },
  blue: { header: "from-[#078FE7] to-[#074483]", amount: "text-[#082C65]" },
  orange: { header: "from-[#F8A028] to-[#E8550C]", amount: "text-[#801C13]" },
  purple: { header: "from-[#BF24CD] to-[#5518A5]", amount: "text-[#4E137B]" },
};
const icons = { train: TrainFront, couple: Users, person: User, none: null };

export function PackagePriceChart({ cards }: { cards: unknown }) {
  const visible = getVisiblePriceCards(cards);
  if (!visible.length) return null;
  return (
    <section aria-labelledby="package-price-chart" className="min-w-0 space-y-3">
      <h2 id="package-price-chart" className="text-[clamp(20px,5vw,27px)] font-bold text-[#0B1026]">Price Chart</h2>
      <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
        {visible.map((card, index) => {
          const theme = themes[card.color];
          const Icon = icons[card.icon];
          return (
            <article key={index} className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-[#E5EAF2] bg-white p-1.5 shadow-sm sm:rounded-[22px] sm:p-2">
              <div className={"flex min-h-[64px] flex-1 items-center justify-center gap-1.5 rounded-xl bg-linear-to-r px-2 py-2.5 text-white sm:gap-3 sm:rounded-2xl sm:px-4 " + theme.header}>
                {Icon && <Icon aria-hidden="true" className="size-5 shrink-0 sm:size-7" strokeWidth={2.3} />}
                <h3 className="min-w-0 text-center text-[10px] font-bold uppercase leading-snug [overflow-wrap:anywhere] sm:text-sm">{card.title}</h3>
              </div>
              <div className="px-1 py-4 text-center sm:px-2 sm:py-5">
                <p className={"font-extrabold leading-tight tracking-tight [overflow-wrap:anywhere] text-[clamp(19px,5vw,40px)] " + theme.amount}>{formatPrice(card.price)}</p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-[#334155] sm:text-xs">{card.unit}</p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
