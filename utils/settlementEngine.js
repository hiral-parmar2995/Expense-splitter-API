
// Minimizes number of transactions needed

const calculateSettlements = (balances) => {

  // Step 1 — Calculate net balance for each person
  // net = totalPaid - totalOwed
  // Positive net → person is owed money (creditor)
  // Negative net → person owes money (debtor)

  const netBalances = balances.map(b => ({
    userId: b.userId,
    name: b.name,
    net: parseFloat(b.totalPaid) - parseFloat(b.totalOwed)
  }));

  // Step 2 — Separate into creditors and debtors
  const creditors = netBalances
    .filter(b => b.net > 0.01)
    .sort((a, b) => b.net - a.net);  // highest first

  const debtors = netBalances
    .filter(b => b.net < -0.01)
    .sort((a, b) => a.net - b.net);  // lowest first

  // Step 3 — Match debtors with creditors
  const settlements = [];

  let i = 0; // creditor index
  let j = 0; // debtor index

  while (i < creditors.length && j < debtors.length) {
    const creditor = creditors[i];
    const debtor = debtors[j];

    // Amount to settle = minimum of what creditor is owed
    // and what debtor owes
    const amount = Math.min(creditor.net, Math.abs(debtor.net));

    if (amount > 0.01) {
      settlements.push({
        from: { userId: debtor.userId, name: debtor.name },
        to: { userId: creditor.userId, name: creditor.name },
        amount: parseFloat(amount.toFixed(2))
      });
    }

    // Reduce balances
    creditor.net -= amount;
    debtor.net += amount;

    // Move to next if fully settled
    if (Math.abs(creditor.net) < 0.01) i++;
    if (Math.abs(debtor.net) < 0.01) j++;
  }

  return settlements;
};

module.exports = { calculateSettlements };