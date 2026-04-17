import { useEffect, useState } from "react";
import { Button, Spinner } from "@heroui/react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import NewForm from "#/components/new-form";
import { getLatestJob } from "#/lib/func/jobs.functions";
import type { JobWithMetadata } from "#/lib/server/jobs/index.server";

export const Route = createFileRoute("/_app_/app/new/$documentationId/status")({
  component: RouteComponent,
});

function RouteComponent() {
  const { documentationId } = Route.useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState<JobWithMetadata | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const pollJobStatus = async () => {
      try {
        const latestJob = await getLatestJob({ data: documentationId });
        setJob(latestJob);
        setLoading(false);

        if (latestJob?.status === "completed" || latestJob?.status === "failed") {
          return;
        }

        setTimeout(pollJobStatus, 2000);
      } catch (error) {
        console.error("Failed to fetch job status:", error);
        setLoading(false);
      }
    };

    void pollJobStatus();
  }, [documentationId]);

  const getStatusMessage = () => {
    if (!job) return "Initializing...";

    switch (job.status) {
      case "pending":
        return "Waiting to start...";
      case "running":
        return "Generating documentation...";
      case "completed":
        return "Documentation generated successfully!";
      case "failed":
        return "Generation failed.";
      case "cancelled":
        return "Generation cancelled.";
      default:
        return "Processing...";
    }
  };

  const getStatusIcon = () => {
    if (!job || job.status === "pending" || job.status === "running") {
      return <Spinner size="lg" />;
    }
    return null;
  };

  const isFinished =
    job?.status === "completed" || job?.status === "failed" || job?.status === "cancelled";

  return (
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
              {getStatusIcon()}
              <p className="text-lg font-medium">{getStatusMessage()}</p>
              {job?.errorMessage && <p className="text-sm text-danger">{job.errorMessage}</p>}
              {job?.status === "running" && (
                <p className="text-sm text-muted-foreground">This may take a few minutes...</p>
              )}
            </div>
            {isFinished && (
              <div className="flex justify-end">
                <Button onPress={() => navigate({ to: "/app" })}>View Documentation</Button>
              </div>
            )}
          </>
        )}
      </div>
    </NewForm>
  );
}
