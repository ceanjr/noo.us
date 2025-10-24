import { Calendar } from 'lucide-react';
import { useState } from 'react';

export default function TimelineSlider({ onPeriodChange }) {
  const [selectedPeriod, setSelectedPeriod] = useState('all');

  const periods = [
    { id: 'today', label: 'Hoje' },
    { id: 'week', label: 'Semana' },
    { id: 'month', label: 'Mês' },
    { id: 'year', label: 'Ano' },
    { id: 'all', label: 'Tudo' },
  ];

  const handlePeriodChange = (periodId) => {
    setSelectedPeriod(periodId);
    onPeriodChange(periodId);
  };

  return (
    <div className="bg-theme-secondary rounded-xl p-3 border border-border-color shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <Calendar className="w-4 h-4 text-primary-600" />
        <span className="text-sm font-semibold text-theme-primary">Linha do Tempo</span>
      </div>

      <div className="flex gap-2 overflow-x-auto scrollbar-hide">
        {periods.map((period) => (
          <button
            key={period.id}
            onClick={() => handlePeriodChange(period.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200
              ${selectedPeriod === period.id
                ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md'
                : 'bg-theme-hover text-theme-secondary hover:bg-primary-500/10 hover:text-primary-600'
              }`}
          >
            {period.label}
          </button>
        ))}
      </div>
    </div>
  );
}
