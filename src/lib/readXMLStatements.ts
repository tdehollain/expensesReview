import xml2js from "xml2js";
const parseStringPromise = xml2js.parseStringPromise;

export default async function readXMLStatemnts(rawXml: string) {
  const res = await parseStringPromise(rawXml);

  const rawStatements = res.Document.BkToCstmrStmt[0].Stmt;
  // console.log(JSON.stringify(rawStatements[6], null, 2));
  const statements = [];
  for (const rawStatement of rawStatements) {
    for (const entry of rawStatement.Ntry) {
      const isDebit = entry.CdtDbtInd[0] === "DBIT";
      const transaction = {
        id: entry.NtryRef[0],
        date: entry.ValDt?.[0].Dt?.[0],
        amount: parseFloat(entry.Amt[0]["_"]),
        isDebit,
        party: {
          name: entry.NtryDtls[0].TxDtls[0].RltdPties?.[0][isDebit ? "Cdtr" : "Dbtr"]?.[0].Nm?.[0],
          country: entry.NtryDtls[0].TxDtls[0].RltdPties?.[0][isDebit ? "Cdtr" : "Dbtr"]?.[0].PstlAdr?.[0].Ctry?.[0],
          address: entry.NtryDtls[0].TxDtls[0].RltdPties?.[0][isDebit ? "Cdtr" : "Dbtr"]?.[0].PstlAdr?.[0].AdrLine?.[0],
          IBAN: entry.NtryDtls[0].TxDtls[0].RltdPties?.[0].CdtrAcct?.[0].Id?.[0].IBAN?.[0],
        },
        communication: entry.NtryDtls[0].TxDtls[0].RmtInf?.[0].Ustrd?.[0],
      };
      statements.push(transaction);
    }
  }
  return statements;
}
