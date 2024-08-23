"use client";

import uploadFile from "@/actions/upload-action";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

export default function FileUploader() {
  return (
    <form action={uploadFile}>
      <Label htmlFor="file">File</Label>
      <div className="flex gap-3">
        <Input id="file" name="file" type="file" className="cursor-pointer" />
        <Button type="submit" variant={"outline"}>
          Submit
        </Button>
      </div>
    </form>
  );
}
