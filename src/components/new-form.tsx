import type { ReactNode } from "react";
import { Button } from "@heroui/react";
import SolarArrowLeftLinear from "~icons/solar/arrow-left-linear";

type Props = {
  title: string;
  description: string;
  onBack?: () => void;
  children: ReactNode;
};

const NewForm = ({ title, description, onBack, children }: Props) => {
  return (
    <div className="max-w-md w-full mx-auto border border-dashed p-1 rounded-2xl">
      <div className="border p-6 rounded-xl bg-surface shadow-xl shadow-black/6 max-h-[calc(100vh-10rem)] overflow-y-auto">
        <div className="flex items-center justify-between gap-2">
          <div className="size-10">
            <img src="/archon.svg" alt="Archon Logo" />
          </div>
          {onBack && (
            <Button size="sm" variant="ghost" onPress={onBack} aria-label="Back">
              <SolarArrowLeftLinear className="size-4" /> Back
            </Button>
          )}
        </div>
        <div>
          <h3 className="text-lg mb-1 mt-4">{title}</h3>
          <p>{description}</p>
        </div>
        {children}
      </div>
    </div>
  );
};

export default NewForm;
