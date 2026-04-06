import { InfoIcon } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";

export default function InfoAlert({ text }: { text: string }) {
  return (
    <Alert>
      <InfoIcon />
      <AlertDescription className=" text-gray-400">
        <p>{text}</p>
      </AlertDescription>
    </Alert>
  );
}
