import { useEffect, useState } from "react";
import { Button, Description, InputGroup, Label, Modal, Spinner, TextField } from "@heroui/react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import NewForm from "#/components/new-form";
import { getLatestJob, cancelDocumentationJob } from "#/lib/func/jobs.functions";
import { regenerateDocumentation, getDocumentationForEdit } from "#/lib/func/docs.functions";
import type { JobWithMetadata } from "#/lib/server/jobs/index.server";

export const Route = createFileRoute("/_app_/app/new/$documentationId/status")({
  component: RouteComponent,
});

function RouteComponent() {
  const { documentationId } = Route.useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState<JobWithMetadata | null>(null);
  const [docGenerated, setDocGenerated] = useState(false);
  const [docSlug, setDocSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false);
  const [regenerateStep, setRegenerateStep] = useState<"confirm" | "instructions">("confirm");
  const [regenerateInstructions, setRegenerateInstructions] = useState("");

  const handleCancel = async () => {
    if (!job) return;
    setCancelling(true);
    try {
      await cancelDocumentationJob({ data: job.id });
      setJob({ ...job, status: "cancelled" });
    } catch {
      setCancelling(false);
    }
  };

  const fetchDocInfo = async (): Promise<{ isGenerated: boolean; slug: string | null }> => {
    try {
      const doc = await getDocumentationForEdit({ data: documentationId });
      return {
        isGenerated: doc?.isGenerated ?? false,
        slug: doc?.slug ?? null,
      };
    } catch {
      return { isGenerated: false, slug: null };
    }
  };

  useEffect(() => {
    let cancelled = false;

    const pollJobStatus = async () => {
      try {
        const latestJob = await getLatestJob({ data: documentationId });
        if (cancelled) return;
        setJob(latestJob);

        if (latestJob?.status === "completed") {
          const docInfo = await fetchDocInfo();
          if (cancelled) return;
          setDocGenerated(docInfo.isGenerated);
          setDocSlug(docInfo.slug);
        }

        setLoading(false);

        if (
          latestJob?.status === "completed" ||
          latestJob?.status === "failed" ||
          latestJob?.status === "cancelled"
        ) {
          return;
        }

        setTimeout(pollJobStatus, 2000);
      } catch (error) {
        console.error("Failed to fetch job status:", error);
        if (!cancelled) setLoading(false);
      }
    };

    void pollJobStatus();
    return () => {
      cancelled = true;
    };
  }, [documentationId]);

  const startPolling = () => {
    const pollJobStatus = async () => {
      try {
        const latestJob = await getLatestJob({ data: documentationId });
        setJob(latestJob);

        if (latestJob?.status === "completed") {
          const docInfo = await fetchDocInfo();
          setDocGenerated(docInfo.isGenerated);
          setDocSlug(docInfo.slug);
        }

        setLoading(false);

        if (
          latestJob?.status === "completed" ||
          latestJob?.status === "failed" ||
          latestJob?.status === "cancelled"
        ) {
          return;
        }

        setTimeout(pollJobStatus, 2000);
      } catch (error) {
        console.error("Failed to fetch job status:", error);
        setLoading(false);
      }
    };

    void pollJobStatus();
  };

  const handleRegenerate = async () => {
    setRegenerating(true);
    try {
      await regenerateDocumentation({
        data: {
          documentationId,
          ...(regenerateInstructions.trim() && {
            customInstructions: regenerateInstructions.trim(),
          }),
        },
      });
      setJob(null);
      setLoading(true);
      setRegenerating(false);
      setShowRegenerateConfirm(false);
      startPolling();
    } catch {
      setRegenerating(false);
      setShowRegenerateConfirm(false);
    }
  };

  const isTrulyCompleted = job?.status === "completed" && docGenerated;

  const getStatusMessage = () => {
    if (!job) return "Initializing...";

    switch (job.status) {
      case "pending":
        return "Waiting to start...";
      case "running":
        return "Generating documentation...";
      case "completed":
        return docGenerated
          ? "Documentation generated successfully!"
          : "Generation incomplete — documentation was not finalized.";
      case "failed":
        return "Generation failed.";
      case "cancelled":
        return "Generation cancelled.";
      default:
        return "Processing...";
    }
  };

  const isActive = !job || job.status === "pending" || job.status === "running";

  return (
    <>
      <NewForm
        title="Documentation Status"
        description="Track your documentation generation progress"
        onBack={() => navigate({ to: "/app" })}
      >
        <div className="mt-4 flex flex-col gap-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <Spinner size="lg" />
            </div>
          ) : (
            <>
              <div className="flex flex-col items-center gap-1 p-4 border border-gray-200 rounded-lg">
                {isActive && <Spinner size="lg" />}
                <p className="text-lg font-medium">{getStatusMessage()}</p>
                {job?.errorMessage && <p className="text-sm text-danger">{job.errorMessage}</p>}
                {job?.status === "running" && (
                  <p className="text-sm text-muted-foreground">This may take a few minutes...</p>
                )}
              </div>
              <div className="flex justify-end gap-2">
                {isActive && (
                  <Button variant="outline" onPress={handleCancel} isDisabled={cancelling}>
                    {cancelling ? <Spinner size="sm" /> : "Cancel"}
                  </Button>
                )}
                {(job?.status === "failed" || job?.status === "cancelled" || (job?.status === "completed" && !docGenerated)) && (
                  <Button
                    onPress={() => {
                      const skipConfirm = job?.status !== "completed";
                      setRegenerateStep(skipConfirm ? "instructions" : "confirm");
                      setRegenerateInstructions("");
                      setShowRegenerateConfirm(true);
                    }}
                    isDisabled={regenerating}
                  >
                    {regenerating ? <Spinner size="sm" /> : "Regenerate"}
                  </Button>
                )}
                {isTrulyCompleted && docSlug && (
                  <Button onPress={() => navigate({ to: "/docs/$slug", params: { slug: docSlug } })}>
                    View Documentation
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </NewForm>

      <Modal>
        <Modal.Backdrop
          isOpen={showRegenerateConfirm}
          onOpenChange={setShowRegenerateConfirm}
        >
          <Modal.Container>
            <Modal.Dialog>
              <Modal.CloseTrigger />
              <Modal.Header>
                <Modal.Heading>Regenerate Documentation</Modal.Heading>
              </Modal.Header>
              <Modal.Body>
                {regenerateStep === "confirm" ? (
                  <p className="text-sm text-default-500">
                    This will delete all existing documentation pages and restart the generation
                    process from scratch. This action cannot be undone.
                  </p>
                ) : (
                  <TextField name="regenerate-instructions" variant="secondary" aria-label="Custom instructions for regeneration">
                    <Label>Custom Instructions (optional)</Label>
                    <InputGroup variant="secondary">
                      <InputGroup.TextArea
                        aria-label="Custom instructions for regeneration"
                        placeholder="e.g. Focus on API endpoints, use TypeScript examples..."
                        rows={4}
                        className="resize-none"
                        value={regenerateInstructions}
                        onChange={(e) => setRegenerateInstructions(e.target.value)}
                      />
                    </InputGroup>
                    <Description>
                      Soft guidance for the AI — tone, focus areas, or output preferences
                    </Description>
                  </TextField>
                )}
              </Modal.Body>
              <Modal.Footer>
                <Button variant="outline" onPress={() => setShowRegenerateConfirm(false)}>
                  Cancel
                </Button>
                {regenerateStep === "confirm" ? (
                  <Button onPress={() => setRegenerateStep("instructions")}>
                    Next
                  </Button>
                ) : (
                  <Button
                    className="bg-danger text-danger-foreground"
                    onPress={handleRegenerate}
                    isDisabled={regenerating}
                  >
                    {regenerating ? <Spinner size="sm" /> : "Regenerate"}
                  </Button>
                )}
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </>
  );
}
