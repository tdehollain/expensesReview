// const parser = new xml2js.Parser();

import readXMLStatemnts from "@/lib/readXMLStatements";

export default async function uploadFile(formData: FormData) {
  const file = formData.get("file") as File;
  const rawXml = await file.text();

  const statements = await readXMLStatemnts(rawXml);

  console.log(statements);
}
