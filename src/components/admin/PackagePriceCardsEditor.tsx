"use client";

import { PRICE_CARD_COLORS, PRICE_CARD_ICONS, PRICE_CARD_UNITS, MAX_PRICE_CARDS, type PriceCard } from "@/lib/package-price-cards";

export type PriceCardDraft = Omit<PriceCard, "price"> & { price: string };
const field = "w-full min-h-[44px] rounded-xl border border-[#E8ECF3] bg-white px-3 py-2 text-sm";

export function PackagePriceCardsEditor({ cards, onChange, disabled }: { cards: PriceCardDraft[]; onChange: (cards: PriceCardDraft[]) => void; disabled: boolean }) {
  function update(index: number, patch: Partial<PriceCardDraft>) {
    onChange(cards.map((card, i) => i === index ? { ...card, ...patch } : card));
  }
  function add() {
    if (cards.length >= MAX_PRICE_CARDS) return;
    onChange([...cards, { title: "", price: "", unit: "per person", color: PRICE_CARD_COLORS[cards.length % PRICE_CARD_COLORS.length], icon: "train", visible: true }]);
  }
  function remove(index: number) {
    if (window.confirm("Remove this price card? Save Package to publish the change.")) onChange(cards.filter((_, i) => i !== index));
  }
  function move(index: number, direction: number) {
    const target = index + direction;
    if (target < 0 || target >= cards.length) return;
    const next = [...cards];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }
  return (
    <fieldset disabled={disabled} className="space-y-4 rounded-3xl border border-[#E8ECF3] bg-white p-4 sm:p-6 shadow-sm disabled:opacity-60">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h3 className="font-extrabold text-base text-[#0B1026]">Package Price Chart</h3><p className="mt-1 text-xs text-gray-500">Optional display cards. These do not change the selling price or booking calculations.</p></div>
        <button type="button" onClick={add} disabled={cards.length >= MAX_PRICE_CARDS} className="rounded-xl bg-[#3478F6] px-4 py-3 text-sm font-bold text-white disabled:opacity-50">+ Add price card</button>
      </div>
      {!cards.length && <p className="rounded-xl bg-[#F3F7FF] p-4 text-sm text-gray-600">No price cards added. The Price Chart section will not appear on the public package page.</p>}
      <div className="grid gap-3 sm:grid-cols-2">
        {cards.map((card, index) => (
          <div key={index} className="min-w-0 space-y-3 rounded-2xl border border-[#E8ECF3] bg-[#F8FAFC] p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-bold">Card {index + 1}</span>
              <div className="flex flex-wrap gap-2">
                <button type="button" disabled={index === 0} onClick={() => move(index, -1)} aria-label={"Move card " + (index + 1) + " up"} className="rounded-lg border bg-white px-2 py-1 disabled:opacity-40">↑</button>
                <button type="button" disabled={index === cards.length - 1} onClick={() => move(index, 1)} aria-label={"Move card " + (index + 1) + " down"} className="rounded-lg border bg-white px-2 py-1 disabled:opacity-40">↓</button>
                <button type="button" onClick={() => remove(index)} className="rounded-lg border border-red-200 px-2 py-1 text-xs font-bold text-red-700">Delete</button>
              </div>
            </div>
            <label className="block space-y-1 text-xs font-semibold">Card title<input className={field} value={card.title} maxLength={100} placeholder="Per person with sleeper ticket" onChange={e => update(index, { title: e.target.value })} /></label>
            <div className="grid grid-cols-2 gap-2">
              <label className="block min-w-0 space-y-1 text-xs font-semibold">Price (₹)<input type="number" min={1} max={99999999} step={1} className={field} value={card.price} placeholder="10499" onChange={e => update(index, { price: e.target.value })} /></label>
              <label className="block min-w-0 space-y-1 text-xs font-semibold">Price unit<select className={field} value={card.unit} onChange={e => update(index, { unit: e.target.value as PriceCard["unit"] })}>{PRICE_CARD_UNITS.map(v => <option key={v}>{v}</option>)}</select></label>
              <label className="block min-w-0 space-y-1 text-xs font-semibold">Colour<select className={field} value={card.color} onChange={e => update(index, { color: e.target.value as PriceCard["color"] })}>{PRICE_CARD_COLORS.map(v => <option key={v}>{v}</option>)}</select></label>
              <label className="block min-w-0 space-y-1 text-xs font-semibold">Icon<select className={field} value={card.icon} onChange={e => update(index, { icon: e.target.value as PriceCard["icon"] })}>{PRICE_CARD_ICONS.map(v => <option key={v}>{v}</option>)}</select></label>
            </div>
            <label className="flex min-h-[40px] items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={card.visible} onChange={e => update(index, { visible: e.target.checked })} /> Show on website</label>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-500">Click Save Package to publish additions, edits, visibility or deletions. Only visible cards appear to customers.</p>
    </fieldset>
  );
}
