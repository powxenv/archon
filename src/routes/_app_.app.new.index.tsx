import { useState } from "react";
import { Button, InputGroup, TextField } from "@heroui/react";
import { createFileRoute } from "@tanstack/react-router";
import SolarTrashBinMinimalistic2Linear from "~icons/solar/trash-bin-minimalistic-2-linear";
import SolarAddCircleLinear from "~icons/solar/add-circle-linear";
import NewForm from "#/components/new-form";

export const Route = createFileRoute("/_app_/app/new/")({
  component: RouteComponent,
});

type Step = "name" | "repos";

function RouteComponent() {
  const [step, setStep] = useState<Step>("name");
  const [name, setName] = useState("");
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

  if (step === "name") {
    return (
      <NewForm
        title="Name Your Documentation"
        description="Pick a clear name so you can easily find it later"
      >
        <div className="mt-4 flex flex-col gap-2">
          <TextField name="doc-name" variant="secondary">
            <InputGroup variant="secondary">
              <InputGroup.Input
                aria-label="Documentation name"
                placeholder="e.g. Frontend API Docs"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </InputGroup>
          </TextField>
          <div className="flex justify-end">
            <Button onPress={() => setStep("repos")} isDisabled={!name.trim()}>
              Next
            </Button>
          </div>
        </div>
      </NewForm>
    );
  }

  return (
    <NewForm
      title="Add Repositories"
      description="Link the Git repos you want to generate documentation from"
      onBack={() => setStep("name")}
    >
      <div className="mt-4 flex flex-col gap-2">
        {repoUrls.map((url, index) =>
          repoUrls.length === 1 ? (
            <TextField key={index} name={`repo-${index}`} variant="secondary">
              <InputGroup variant="secondary">
                <InputGroup.Input
                  aria-label="Repo URL"
                  placeholder="https://github.com/org/repo"
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
                  placeholder="https://github.com/org/repo"
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
          <Button type="submit">Create Documentation</Button>
        </div>
      </div>
    </NewForm>
  );
}
