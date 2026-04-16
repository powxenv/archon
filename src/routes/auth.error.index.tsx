import { createFileRoute, Link } from "@tanstack/react-router";
import { buttonVariants, Chip, cn } from "@heroui/react";
import z from "zod";

const errorSearchSchema = z.object({
  error: z.string(),
  message: z.string().optional(),
});

export const Route = createFileRoute("/auth/error/")({
  validateSearch: errorSearchSchema,
  component: AuthErrorIndex,
});

function AuthErrorIndex() {
  const { error, message } = Route.useSearch();

  return (
    <>
      <main>
        <div className="inner border-x border-dashed min-h-lvh justify-center flex-col flex py-24 relative">
          <div className="max-w-md w-full mx-auto border border-dashed p-1 rounded-2xl">
            <div className="border p-6 rounded-xl bg-surface shadow-xl shadow-black/6">
              <div className="size-10">
                <img src="/archon.svg" alt="Archon Logo" />
              </div>
              <Chip className="mt-4">{error}</Chip>
              <h3 className="text-lg mb-1 mt-2">Failed to Sign In</h3>
              <p>{message || "An error occurred"}</p>
              <div className="mt-4 flex flex-col gap-2">
                <Link to="/auth" className={cn(buttonVariants({ variant: "outline" }), "w-full")}>
                  Back to Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
