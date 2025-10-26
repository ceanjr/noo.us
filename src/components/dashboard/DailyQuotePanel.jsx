export default function DailyQuotePanel({ dailyQuote }) {
  if (!dailyQuote) return null;

  return (
    <div className="bg-secondary-50 rounded-2xl border border-secondary-200 shadow-sm p-6">
      <div className="flex items-start gap-4">
        <div className="bg-secondary-500 p-3 rounded-xl shadow-md flex-shrink-0">
          {/* musical note icon via emoji to avoid extra imports */}
          <span className="w-6 h-6 text-white text-lg leading-none">♪</span>
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-bold text-secondary-600 mb-2">Trecho do Dia</h3>
          <p className="text-base sm:text-lg italic text-theme-primary mb-2 leading-relaxed">
            "{dailyQuote.trecho}"
          </p>
          <p className="text-sm text-theme-secondary font-medium">- {dailyQuote.artista}</p>
        </div>
      </div>
    </div>
  );
}

