"use client";

import React, { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// import xml2js from 'xml2js';
const xml2js = require("xml2js");

const parseString = xml2js.parseString;

export default function Home() {
  const [file, setFile] = React.useState<File>();
  const [statements, setStatements] = React.useState<any[]>([]);

  useEffect(() => {
    if (file) {
      const fileReader = new FileReader();
      fileReader.onload = () => {
        const fileContent = fileReader.result as string;
        // console.log(fileContent);

        parseString(fileContent, (err: ErrorCallback, res: any) => {
          const rawStatements = res.Document.BkToCstmrStmt[0].Stmt;
          // console.log(JSON.stringify(rawStatements[6], null, 2));
          const newStatements = [];
          for (const rawStatement of rawStatements) {
            for (const entry of rawStatement.Ntry) {
              const isDebit = entry.CdtDbtInd[0] === "DBIT";
              const transaction = {
                date: new Date(entry.BookgDt[0].DtTm[0]),
                amount: parseFloat(entry.Amt[0]["-"]),
                isDebit,
                party: {
                  name: entry.NtryDtls[0].TxDtls[0].RltdPties?.[0][isDebit ? "Cdtr" : "Dbtr"]?.[0].Nm?.[0],
                  country: entry.NtryDtls[0].TxDtls[0].RltdPties?.[0][isDebit ? "Cdtr" : "Dbtr"]?.[0].PstlAdr?.[0].Ctry?.[0],
                  address: entry.NtryDtls[0].TxDtls[0].RltdPties?.[0][isDebit ? "Cdtr" : "Dbtr"]?.[0].PstlAdr?.[0].AdrLine?.[0],
                  IBAN: entry.NtryDtls[0].TxDtls[0].RltdPties?.[0].CdtrAcct?.[0].Id?.[0].IBAN?.[0],
                },
                communication: entry.NtryDtls[0].TxDtls[0].RmtInf?.[0].Ustrd?.[0],
              };
              newStatements.push(transaction);
            }
          }
          setStatements(newStatements);
        });
      };
      const fileContent = fileReader.readAsText(file);
    }
  }, [file]);

  const readFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.item(0);
    if (file) setFile(file);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1>Expenses</h1>
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="inputFile">XML file</Label>
        <Input id="inputFile" type="file" accept="xml" onChange={readFile} />
      </div>
    </main>
  );
}
