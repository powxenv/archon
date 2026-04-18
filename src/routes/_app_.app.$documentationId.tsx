import { createFileRoute, Link, useNavigate, notFound, redirect } from "@tanstack/react-router";
import {
  Autocomplete,
  Button,
  buttonVariants,
  cn,
  Description,
  EmptyState,
  FieldError,
  FieldGroup,
  InputGroup,
  Label,
  ListBox,
  Modal,
  SearchField,
  Spinner,
  Switch,
  TextField,
  useFilter,
} from "@heroui/react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { useState } from "react";
import SolarArrowLeftLinear from "~icons/solar/arrow-left-linear";
import SolarEyeLinear from "~icons/solar/eye-linear";
import SolarAddCircleLinear from "~icons/solar/add-circle-linear";
import SolarTrashBinMinimalistic2Linear from "~icons/solar/trash-bin-minimalistic-2-linear";
import SolarDisketteLinear from "~icons/solar/diskette-linear";
import SolarRestartLinear from "~icons/solar/restart-linear";
import SolarPenNewSquareLinear from "~icons/solar/pen-new-square-linear";
import {
  getDocumentationForEdit,
  updateDocumentation,
  regenerateDocumentation,
  getRepoBranches,
} from "#/lib/func/docs.functions";

const editSchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name must be at most 255 characters"),
  description: z.string().optional(),
});

type EditValues = z.infer<typeof editSchema>;

export const Route = createFileRoute("/_app_/app/$documentationId")({
  loader: async ({ params }) => {
    const documentation = await getDocumentationForEdit({ data: params.documentationId });
    if (!documentation) throw notFound();
    if (!documentation.isGenerated) {
      throw redirect({
        to: "/app/new/$documentationId/status",
        params: { documentationId: params.documentationId },
      });
    }
    return { documentation };
  },
  component: EditDocumentationPage,
});

function EditDocumentationPage() {
  const { documentation } = Route.useLoaderData();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saved, setSaved] = useState(false);
  const [repos, setRepos] = useState(
    documentation.repositories.map((r: { url: string; branch: string | null }) => ({
      url: r.url,
      branch: r.branch ?? "main",
    })),
  );
  const [isPublic, setIsPublic] = useState(documentation.isPublic);
  const [togglingPublic, setTogglingPublic] = useState(false);
  const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  const form = useForm<EditValues>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      name: documentation.name,
      description: documentation.description ?? "",
    },
  });

  const onSave = async (data: EditValues) => {
    setSaving(true);
    setSaveError("");
    setSaved(false);
    try {
      await updateDocumentation({
        data: {
          documentationId: documentation.id,
          name: data.name,
          description: data.description,
          repositories: repos,
        },
      });
      setSaved(true);
    } catch {
      setSaveError("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const handleReposSave = (updatedRepos: Array<{ url: string; branch: string }>) => {
    setRepos(updatedRepos);
  };

  const handleTogglePublic = async (value: boolean) => {
    setTogglingPublic(true);
    try {
      await updateDocumentation({
        data: { documentationId: documentation.id, isPublic: value },
      });
      setIsPublic(value);
    } catch {
      // revert on failure
    } finally {
      setTogglingPublic(false);
    }
  };

  const handleRegenerate = async () => {
    setRegenerating(true);
    try {
      await regenerateDocumentation({ data: documentation.id });
      void navigate({
        to: "/app/new/$documentationId/status",
        params: { documentationId: documentation.id },
      });
    } catch {
      setRegenerating(false);
      setShowRegenerateConfirm(false);
    }
  };

  return (
    <main>
      <div className="inner border-x border-dashed min-h-lvh justify-center flex-col flex py-24 relative">
        <div className="max-w-md w-full mx-auto border border-dashed p-1 rounded-2xl">
          <div className="border p-6 rounded-xl bg-surface shadow-xl shadow-black/6 max-h-[calc(100vh-10rem)] overflow-y-auto">
            <div className="flex items-center justify-between gap-2">
              <div className="size-10">
                <img src="/archon.svg" alt="Archon Logo" />
              </div>
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onPress={() => navigate({ to: "/app" })}
                  aria-label="Back"
                >
                  <SolarArrowLeftLinear className="size-4" />
                  Back
                </Button>
                {documentation.isGenerated && (
                  <Link
                    to="/docs/$slug"
                    params={{ slug: documentation.slug }}
                    className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
                  >
                    <SolarEyeLinear className="size-4" />
                    View
                  </Link>
                )}
              </div>
            </div>
            <h3 className="text-lg mb-1 mt-4">Edit Documentation</h3>
            <p className="text-sm text-default-500">
              Update your documentation settings and repositories
            </p>

            <form onSubmit={form.handleSubmit(onSave)}>
              <FieldGroup className="mt-4 flex flex-col gap-3">
                <Controller
                  name="name"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <TextField variant="secondary" isInvalid={fieldState.invalid}>
                      <Label>Name</Label>
                      <InputGroup variant="secondary">
                        <InputGroup.Input
                          {...field}
                          aria-label="Name"
                          placeholder="Documentation name"
                        />
                      </InputGroup>
                      {fieldState.invalid && <FieldError>{fieldState.error?.message}</FieldError>}
                    </TextField>
                  )}
                />

                <Controller
                  name="description"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <TextField variant="secondary" isInvalid={fieldState.invalid}>
                      <Label>Description</Label>
                      <InputGroup variant="secondary">
                        <InputGroup.TextArea
                          {...field}
                          aria-label="Description"
                          placeholder="Brief description of this documentation"
                          rows={10}
                          className="resize-none"
                        />
                      </InputGroup>
                      {fieldState.invalid && <FieldError>{fieldState.error?.message}</FieldError>}
                    </TextField>
                  )}
                />

                <div>
                  <div className="flex items-center justify-between">
                    <Label>
                      {repos.length} {repos.length === 1 ? "repository" : "repositories"}
                    </Label>
                    <EditReposModal repos={repos} onSave={handleReposSave} />
                  </div>
                </div>

                <div className="flex items-start justify-between">
                  <Label className="mt-1">Public access</Label>
                  <div className="flex flex-col items-end gap-1">
                    <Switch
                      isSelected={isPublic}
                      onChange={() => handleTogglePublic(!isPublic)}
                      isDisabled={togglingPublic}
                    >
                      <Switch.Content>
                        <Switch.Control>
                          <Switch.Thumb />
                        </Switch.Control>
                      </Switch.Content>
                    </Switch>
                    <span className="text-xs text-default-400">
                      {isPublic ? "Anyone with the link can view it" : "Only you can view this"}
                    </span>
                  </div>
                </div>

                {saveError && <p className="text-sm text-danger">{saveError}</p>}
                {saved && <p className="text-sm text-success">Saved</p>}

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    {documentation.isDirty && (
                      <span className="text-xs text-warning border border-warning/30 rounded-full px-2 py-0.5">
                        Unpublished changes
                      </span>
                    )}
                    <Button
                      variant="outline"
                      onPress={() => setShowRegenerateConfirm(true)}
                      isDisabled={regenerating}
                    >
                      {regenerating ? (
                        <Spinner size="sm" />
                      ) : (
                        <SolarRestartLinear className="size-4" />
                      )}
                      Regenerate
                    </Button>
                  </div>
                  <Button type="submit" isDisabled={saving}>
                    {saving ? <Spinner size="sm" /> : <SolarDisketteLinear className="size-4" />}
                    Save
                  </Button>
                </div>
              </FieldGroup>
            </form>
          </div>
        </div>
      </div>

      <Modal>
        <Modal.Backdrop isOpen={showRegenerateConfirm} onOpenChange={setShowRegenerateConfirm}>
          <Modal.Container>
            <Modal.Dialog>
              <Modal.Header>
                <Modal.Heading>Regenerate Documentation</Modal.Heading>
              </Modal.Header>
              <Modal.Body>
                <p className="text-sm text-default-500">
                  This will delete all existing documentation pages and restart the generation
                  process from scratch. This action cannot be undone.
                </p>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="outline" onPress={() => setShowRegenerateConfirm(false)}>
                  Cancel
                </Button>
                <Button
                  className="bg-danger text-danger-foreground"
                  onPress={handleRegenerate}
                  isDisabled={regenerating}
                >
                  {regenerating ? <Spinner size="sm" /> : "Regenerate"}
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </main>
  );
}

type RepoStep = "repos" | "branches";

function EditReposModal({
  repos,
  onSave,
}: {
  repos: Array<{ url: string; branch: string }>;
  onSave: (repos: Array<{ url: string; branch: string }>) => void;
}) {
  const [step, setStep] = useState<RepoStep>("repos");
  const [repoUrls, setRepoUrls] = useState(repos.map((r) => r.url));
  const [urlErrors, setUrlErrors] = useState<Record<number, string>>({});
  const [branches, setBranches] = useState<Record<number, string>>(
    Object.fromEntries(repos.map((r, i) => [i, r.branch])),
  );
  const [repoBranchOptions, setRepoBranchOptions] = useState<Record<number, string[]>>({});
  const [branchesLoading, setBranchesLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { contains } = useFilter({ sensitivity: "base" });

  const validateRepoUrl = (url: string): string => {
    if (!url.trim()) return "";
    if (!url.startsWith("https://")) return "Repository URL must use HTTPS";
    try {
      new URL(url);
    } catch {
      return "Invalid URL format";
    }
    return "";
  };

  const updateUrl = (index: number, value: string) => {
    setRepoUrls((prev) => prev.map((url, i) => (i === index ? value : url)));
    setUrlErrors((prev) => ({ ...prev, [index]: validateRepoUrl(value) }));
  };

  const addUrl = () => setRepoUrls((prev) => [...prev, ""]);

  const removeUrl = (index: number) => {
    setRepoUrls((prev) => prev.filter((_, i) => i !== index));
    setUrlErrors((prev) => {
      const next = { ...prev };
      delete next[index];
      return next;
    });
    setBranches((prev) => {
      const next: Record<number, string> = {};
      for (const [k, v] of Object.entries(prev)) {
        const ki = Number(k);
        if (ki < index) next[ki] = v;
        else if (ki > index) next[ki - 1] = v;
      }
      return next;
    });
  };

  const allReposFilled = repoUrls.every((url) => url.trim().length > 0);
  const hasUrlErrors = Object.values(urlErrors).some((e) => e.length > 0);

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

  const handleSave = () => {
    setSaving(true);
    const updatedRepos = repoUrls.map((url, i) => ({
      url,
      branch: branches[i] || "main",
    }));
    onSave(updatedRepos);
    setSaving(false);
  };

  const handleOpen = () => {
    setStep("repos");
    setRepoUrls(repos.map((r) => r.url));
    setUrlErrors({});
    setBranches(Object.fromEntries(repos.map((r, i) => [i, r.branch])));
    setRepoBranchOptions({});
  };

  return (
    <Modal>
      <Button variant="outline" size="sm" onPress={handleOpen}>
        <SolarPenNewSquareLinear className="size-4" />
        Edit Repositories
      </Button>
      <Modal.Backdrop>
        <Modal.Container>
          <Modal.Dialog>
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>
                {step === "repos" ? "Edit Repositories" : "Select Branches"}
              </Modal.Heading>
            </Modal.Header>

            <Modal.Body>
              {step === "repos" ? (
                <div className="flex flex-col gap-2">
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
                        {urlErrors[index] && (
                          <p className="text-sm text-danger">{urlErrors[index]}</p>
                        )}
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
                        {urlErrors[index] && (
                          <p className="text-sm text-danger">{urlErrors[index]}</p>
                        )}
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
              ) : (
                <div className="flex flex-col gap-4">
                  {repoUrls.map((url, index) => (
                    <BranchAutocomplete
                      key={index}
                      repoUrl={url}
                      options={repoBranchOptions[index] ?? []}
                      selectedKey={branches[index] ?? null}
                      onSelect={(key) => setBranches((prev) => ({ ...prev, [index]: key }))}
                      filter={contains}
                    />
                  ))}
                </div>
              )}
            </Modal.Body>

            <Modal.Footer>
              {step === "branches" && (
                <Button variant="outline" onPress={() => setStep("repos")}>
                  <SolarArrowLeftLinear className="size-4" />
                  Back
                </Button>
              )}
              {step === "branches" && (
                <Button onPress={handleSave} isDisabled={!allBranchesSelected || saving}>
                  {saving ? <Spinner size="sm" /> : "Save Repositories"}
                </Button>
              )}
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
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
