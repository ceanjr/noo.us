import MomentCard from "./MomentCard";

export default function MomentsGrid({
  moments,
  onReact,
  isPrivateMode,
  revealedSurprises,
  onRevealSurprise,
  onOpenSurprise,
}) {
  return (
    <div className="flex flex-wrap gap-3 justify-start w-full">
      {moments.map((moment, index) => (
        <div
          key={moment.id}
          className="animate-slide-up"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <MomentCard
            moment={moment}
            onReact={onReact}
            isPrivateMode={isPrivateMode}
            size={moment.size || "medium"}
            isRevealed={revealedSurprises.has(moment.id)}
            onReveal={() => onRevealSurprise(moment.id)}
            onOpen={() => onOpenSurprise?.(moment)}
          />
        </div>
      ))}
    </div>
  );
}

