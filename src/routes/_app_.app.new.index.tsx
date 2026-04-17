import { useState } from "react";
import {
  Autocomplete,
  Button,
  Description,
  EmptyState,
  InputGroup,
  Label,
  ListBox,
  Radio,
  RadioGroup,
  SearchField,
  Spinner,
  TextField,
  useFilter,
} from "@heroui/react";
import type { ReactElement } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import SolarTrashBinMinimalistic2Linear from "~icons/solar/trash-bin-minimalistic-2-linear";
import SolarAddCircleLinear from "~icons/solar/add-circle-linear";
import SolarCode2Linear from "~icons/solar/code-2-linear";
import SolarDocumentLineDuotone from "~icons/solar/document-line-duotone";
import SolarRocket2Linear from "~icons/solar/rocket-2-linear";
import NewForm from "#/components/new-form";
import { getDocumentationTypes, getRepoBranches, createDocumentation } from "#/lib/func/docs.functions.ts";

const iconMap: Record<string, ReactElement> = {
  onboarding: <SolarRocket2Linear className="size-5" />,
  developer: <SolarCode2Linear className="size-5" />,
  user: <SolarDocumentLineDuotone className="size-5" />,
};

export const Route = createFileRoute("/_app_/app/new/")({
  loader: async () => {
    const documentationTypes = await getDocumentationTypes();
    return { documentationTypes };
  },
  component: RouteComponent,
});

type Step = "name" | "type" | "repos" | "branches";

function RouteComponent() {
  const { documentationTypes } = Route.useLoaderData();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("name");
  const [name, setName] = useState("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [repoUrls, setRepoUrls] = useState<string[]>([""]);
  const [urlErrors, setUrlErrors] = useState<Record<number, string>>({});
  const [branches, setBranches] = useState<Record<number, string>>({});
  const [repoBranchOptions, setRepoBranchOptions] = useState<Record<number, string[]>>({});
  const [branchesLoading, setBranchesLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { contains } = useFilter({ sensitivity: "base" });

  const validateRepoUrl = (url: string): string => {
    if (!url.trim()) {
      return "";
    }
    if (!url.startsWith("https://")) {
      return "Repository URL must use HTTPS (e.g., https://github.com/org/repo)";
    }
    if (url.startsWith("git@")) {
      return "SSH URLs are not supported. Use HTTPS instead.";
    }
    try {
      new URL(url);
    } catch {
      return "Invalid URL format";
    }
    return "";
  };

  const updateUrl = (index: number, value: string) => {
    setRepoUrls((prev) => prev.map((url, i) => (i === index ? value : url)));
    const error = validateRepoUrl(value);
    setUrlErrors((prev) => ({ ...prev, [index]: error }));
  };

  const addUrl = () => {
    setRepoUrls((prev) => [...prev, ""]);
  };

  const removeUrl = (index: number) => {
    setRepoUrls((prev) => prev.filter((_, i) => i !== index));
    setBranches((prev) => {
      const next = { ...prev };
      delete next[index];
      return next;
    });
    setUrlErrors((prev) => {
      const next = { ...prev };
      delete next[index];
      return next;
    });
  };

  const allReposFilled = repoUrls.every((url) => url.trim().length > 0);
  const hasUrlErrors = Object.values(urlErrors).some((error) => error.length > 0);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const repositories = repoUrls.map((url, i) => ({
        url,
        branch: branches[i] || "main",
      }));

      const result = await createDocumentation({
        data: {
          name,
          documentationTypeId: selectedType,
          repositories,
        },
      });

      await navigate({
        to: "/app/new/$documentationId/status",
        params: { documentationId: result.documentation.id },
      });
    } catch (error) {
      console.error("Failed to create documentation:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchBranchesAndContinue = async () => {
    setBranchesLoading(true);
    const results = await Promise.all(
      repoUrls.map((url: string) => getRepoBranches({ data: url })),
    );
    const options: Record<number, string[]> = {};
    results.forEach((repoBranches: string[], i: number) => {
      options[i] = repoBranches;
    });
    setRepoBranchOptions(options);
    setBranchesLoading(false);
    setStep("branches");
  };

  const allBranchesSelected = repoUrls.every((_, i) => branches[i]);

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
            <Button onPress={() => setStep("type")} isDisabled={!name.trim()}>
              Next
            </Button>
          </div>
        </div>
      </NewForm>
    );
  }

  if (step === "type") {
    return (
      <NewForm
        title="Choose Documentation Type"
        description="Select the style that best fits your target audience"
        onBack={() => setStep("name")}
      >
        <div className="mt-4 flex flex-col gap-4">
          <RadioGroup
            name="documentation-type"
            value={selectedType}
            onChange={(value) => setSelectedType(value)}
            variant="secondary"
          >
            {documentationTypes.map((docType) => (
              <Radio key={docType.id} value={docType.id}>
                <Radio.Control>
                  <Radio.Indicator />
                </Radio.Control>
                <Radio.Content>
                  <div className="flex items-center gap-2 mb-2">
                    {iconMap[docType.slug]}
                    <Label>{docType.name}</Label>
                  </div>
                  <Description>{docType.description}</Description>
                </Radio.Content>
              </Radio>
            ))}
          </RadioGroup>
          <div className="flex justify-end">
            <Button onPress={() => setStep("repos")} isDisabled={!selectedType}>
              Next
            </Button>
          </div>
        </div>
      </NewForm>
    );
  }

  if (step === "repos") {
    return (
      <NewForm
        title="Add Repositories"
        description="Link the Git repos you want to generate documentation from (HTTPS only, public repositories)"
        onBack={() => setStep("type")}
      >
        <div className="mt-4 flex flex-col gap-2">
          {repoUrls.map((url, index) =>
            repoUrls.length === 1 ? (
              <div key={index} className="flex flex-col gap-1">
                <TextField
                  name={`repo-${index}`}
                  variant="secondary"
                  isInvalid={Boolean(urlErrors[index])}
                >
                  <InputGroup variant="secondary">
                    <InputGroup.Input
                      aria-label="Repo URL"
                      placeholder="https://github.com/org/repo"
                      value={url}
                      onChange={(e) => updateUrl(index, e.target.value)}
                    />
                  </InputGroup>
                </TextField>
                {urlErrors[index] && <p className="text-sm text-danger">{urlErrors[index]}</p>}
              </div>
            ) : (
              <div key={index} className="flex flex-col gap-1">
                <TextField
                  name={`repo-${index}`}
                  variant="secondary"
                  isInvalid={Boolean(urlErrors[index])}
                >
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
                {urlErrors[index] && <p className="text-sm text-danger">{urlErrors[index]}</p>}
              </div>
            ),
          )}
          <div className="flex items-center justify-between flex-wrap">
            <Button variant="outline" onPress={addUrl}>
              <SolarAddCircleLinear className="size-4" />
              Add More
            </Button>
            <Button
              onPress={fetchBranchesAndContinue}
              isDisabled={!allReposFilled || hasUrlErrors || branchesLoading}
            >
              {branchesLoading ? <Spinner /> : "Next"}
            </Button>
          </div>
        </div>
      </NewForm>
    );
  }

  return (
    <NewForm
      title="Select Branches"
      description="Pick the branch to document for each repository"
      onBack={() => setStep("repos")}
    >
      <div className="mt-4 flex flex-col gap-4">
        {repoUrls.map((url, index) => {
          return (
            <div key={index}>
              <BranchAutocomplete
                repoUrl={url}
                options={repoBranchOptions[index] ?? []}
                selectedKey={branches[index] ?? null}
                onSelect={(key) => setBranches((prev) => ({ ...prev, [index]: key }))}
                filter={contains}
              />
            </div>
          );
        })}
        <div className="flex justify-end">
          <Button onPress={handleSubmit} isDisabled={!allBranchesSelected || isSubmitting}>
            {isSubmitting ? <Spinner size="sm" /> : "Create Documentation"}
          </Button>
        </div>
      </div>
    </NewForm>
  );
}

function BranchAutocomplete({
  repoUrl,
  options,
  selectedKey,
  onSelect,
  filter,
}: {
  repoUrl: string;
  options: string[];
  selectedKey: string | null;
  onSelect: (key: string) => void;
  filter: (key: string, filterText: string) => boolean;
}) {
  return (
    <Autocomplete
      className="w-full"
      placeholder="Select branch"
      selectionMode="single"
      value={selectedKey}
      onChange={(key) => {
        if (key) onSelect(key as string);
      }}
      variant="secondary"
    >
      <Label>{repoUrl}</Label>
      <Autocomplete.Trigger>
        <Autocomplete.Value />
        <Autocomplete.ClearButton />
        <Autocomplete.Indicator />
      </Autocomplete.Trigger>
      <Autocomplete.Popover>
        <Autocomplete.Filter filter={filter}>
          <SearchField autoFocus name="search" variant="secondary">
            <SearchField.Group>
              <SearchField.SearchIcon />
              <SearchField.Input placeholder="Search branches..." />
              <SearchField.ClearButton />
            </SearchField.Group>
          </SearchField>
          <ListBox renderEmptyState={() => <EmptyState>No branches found</EmptyState>}>
            {options.map((name) => (
              <ListBox.Item key={name} id={name} textValue={name}>
                {name}
                <ListBox.ItemIndicator />
              </ListBox.Item>
            ))}
          </ListBox>
        </Autocomplete.Filter>
      </Autocomplete.Popover>
      <Description>Pick the branch to document</Description>
    </Autocomplete>
  );
}
