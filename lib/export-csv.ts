/**
 * #14 Export CSV — Generate and download transaction history as CSV.
 */

interface Transaction {
  date: string;
  type: string;
  kwh: number;
  usdc: number;
  buyer: string;
  txHash: string;
}

export function exportTransactionsCSV(transactions: Transaction[], filename = "lumos-history.csv") {
  const headers = ["Fecha", "Tipo", "kWh", "USDC", "Comprador", "TX Hash"];
  const rows = transactions.map((t) => [
    t.date,
    t.type,
    t.kwh.toFixed(2),
    t.usdc.toFixed(4),
    t.buyer,
    t.txHash,
  ]);

  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

// Demo data export
export function exportDemoCSV() {
  const demoTx: Transaction[] = [
    { date: "2026-05-07", type: "Venta", kwh: 2.2, usdc: 0.198, buyer: "Vecino A", txHash: "5xK9..abc" },
    { date: "2026-05-06", type: "Venta", kwh: 1.5, usdc: 0.135, buyer: "Vecino C", txHash: "7mQ3..def" },
    { date: "2026-05-05", type: "Venta", kwh: 3.1, usdc: 0.279, buyer: "Vecino B", txHash: "3pR8..ghi" },
    { date: "2026-05-04", type: "Venta", kwh: 0.8, usdc: 0.072, buyer: "Vecino A", txHash: "9vL2..jkl" },
    { date: "2026-05-03", type: "Venta", kwh: 2.6, usdc: 0.234, buyer: "Vecino D", txHash: "1nH5..mno" },
  ];
  exportTransactionsCSV(demoTx);
}
