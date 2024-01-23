"use client";

import React, { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { useTheme } from "next-themes";
import { Separator } from "@radix-ui/react-separator";

// import xml2js from 'xml2js';
const xml2js = require("xml2js");

const parseString = xml2js.parseString;

export default function Home() {
  const { theme, setTheme } = useTheme();
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
              newStatements.push(transaction);
            }
          }
          setStatements(newStatements);
        });
      };
      fileReader.readAsText(file);
    }
  }, [file]);

  const readFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.item(0);
    if (file) setFile(file);
  };

  return (
    <div>
      <nav className="w-full p-4 px-8 flex justify-between">
        <h1>Expenses</h1>
        <Button size="icon" variant={"outline"} onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
          <SunIcon className="w-4 h-4 transition-all scale-0 dark:scale-100"></SunIcon>
          <MoonIcon className="absolute w-4 h-4 transition-all scale-100 dark:scale-0"></MoonIcon>
        </Button>
      </nav>
      <Separator className="my-4" />
      <main className="flex min-h-screen flex-col items-center justify-between p-24">
        <div className="grid w-full max-w-screen-xl items-center gap-1.5">
          <section className="w-40 mb-5">
            <Label htmlFor="inputFile">XML file</Label>
            <Input id="inputFile" type="file" accept="xml" onChange={readFile} />
          </section>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">Date</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>IBAN</TableHead>
                <TableHead>Communication</TableHead>
                <TableHead>Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {statements.map((entry) => (
                <TableRow key={entry.id} className="text-xs">
                  <TableCell>{entry.date}</TableCell>
                  <TableCell>{entry.party.name}</TableCell>
                  <TableCell>{entry.party.address}</TableCell>
                  <TableCell>{entry.party.country}</TableCell>
                  <TableCell>{entry.party.IBAN}</TableCell>
                  <TableCell>{entry.communication}</TableCell>
                  <TableCell className="w-24 text-right">{(entry.isDebit ? "-" : "+") + entry.amount + " EUR"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  );
}
