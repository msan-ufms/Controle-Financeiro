export function formatDate(value: string): string {
  if (!value) return "—";
  return new Date(`${value}T12:00:00`).toLocaleDateString("pt-BR");
}

export function getTodayDate(): string {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getFormattedToday(): string {
  return new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
}

export function getMonthOptions() {
  return [
    { label: "Janeiro", value: "1" },
    { label: "Fevereiro", value: "2" },
    { label: "Março", value: "3" },
    { label: "Abril", value: "4" },
    { label: "Maio", value: "5" },
    { label: "Junho", value: "6" },
    { label: "Julho", value: "7" },
    { label: "Agosto", value: "8" },
    { label: "Setembro", value: "9" },
    { label: "Outubro", value: "10" },
    { label: "Novembro", value: "11" },
    { label: "Dezembro", value: "12" },
  ];
}

export function getYearOptions(dates: string[]) {
  const currentYear = new Date().getFullYear();

  return Array.from(
    new Set([
      currentYear,
      ...dates
        .filter(Boolean)
        .map((date) => Number(date.slice(0, 4)))
        .filter((year) => Number.isInteger(year)),
    ]),
  )
    .sort((a, b) => b - a)
    .map((year) => ({
      label: String(year),
      value: String(year),
    }));
}
