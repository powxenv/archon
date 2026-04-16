import { useState } from "react";
import { Button, InputGroup, TextField } from "@heroui/react";
import { createFileRoute } from "@tanstack/react-router";
import SolarTrashBinMinimalistic2Linear from "~icons/solar/trash-bin-minimalistic-2-linear";
import SolarAddCircleLinear from "~icons/solar/add-circle-linear";

export const Route = createFileRoute("/_app_/app/new/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [repoUrls, setRepoUrls] = useState<string[]>([""]);

  const updateUrl = (index: number, value: string) => {
    setRepoUrls((prev) => prev.map((url, i) => (i === index ? value : url)));
  };

  const addUrl = () => {
    setRepoUrls((prev) => [...prev, ""]);
  };

  const removeUrl = (index: number) => {
    setRepoUrls((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <>
      <h3 className="text-lg mb-1 mt-4">Add New Documentation</h3>
      <p>Masukkan link repository yang ingin kamu buat dokumentasi</p>
      <div className="mt-4 flex flex-col gap-2">
        {repoUrls.map((url, index) =>
          repoUrls.length === 1 ? (
            <TextField key={index} name={`repo-${index}`} variant="secondary">
              <InputGroup variant="secondary">
                <InputGroup.Input
                  aria-label="Repo URL"
                  placeholder="Enter repo url"
                  value={url}
                  onChange={(e) => updateUrl(index, e.target.value)}
                />
              </InputGroup>
            </TextField>
          ) : (
            <TextField key={index} name={`repo-${index}`} variant="secondary">
              <InputGroup variant="secondary">
                <InputGroup.Input
                  aria-label={`Repo URL ${index + 1}`}
                  placeholder="Enter repo url"
                  value={url}
                  onChange={(e) => updateUrl(index, e.target.value)}
                />
                <InputGroup.Suffix className="pr-0">
                  <Button
                    isIconOnly
                    aria-label="Remove"
                    size="sm"
                    variant="ghost"
                    onPress={() => removeUrl(index)}
                  >
                    <SolarTrashBinMinimalistic2Linear className="size-4" />
                  </Button>
                </InputGroup.Suffix>
              </InputGroup>
            </TextField>
          ),
        )}
        <div className="flex items-center justify-between flex-wrap">
          <Button variant="outline" onPress={addUrl}>
            <SolarAddCircleLinear className="size-4" />
            Add More
          </Button>
          <Button type="submit">Next</Button>
        </div>
      </div>
    </>
  );
}
