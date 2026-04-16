import { createFileRoute } from "@tanstack/react-router";
import { Button, Spinner } from "@heroui/react";
import { authClient } from "#/lib/client/auth";
import { useTransition } from "react";

export const Route = createFileRoute("/auth/")({
  component: AuthIndex,
});

function AuthIndex() {
  const [isPending, startTransition] = useTransition();

  const signIn = () =>
    startTransition(async () => {
      await authClient.signIn.social({
        provider: "github",
      });
    });

  return (
    <>
      <main>
        <div className="inner border-x border-dashed min-h-lvh justify-center flex-col flex py-24 relative">
          <div className="max-w-md w-full mx-auto border border-dashed p-1 rounded-2xl">
            <div className="border p-6 rounded-xl bg-surface shadow-xl shadow-black/6">
              <div className="size-10">
                <img src="/archon.svg" alt="Archon Logo" />
              </div>
              <h3 className="text-lg mb-1 mt-4">Sign In</h3>
              <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit.</p>
              <div className="mt-4 flex flex-col gap-2">
                <Button className="w-full" variant="outline" onClick={signIn}>
                  {isPending ? (
                    <Spinner />
                  ) : (
                    <>
                      <img className="size-4" src="/brand/gh.png" alt="Github Logo" />
                      Sign in with Github
                    </>
                  )}
                </Button>

                <Button className="w-full" variant="outline" isDisabled>
                  <img className="size-4" src="/brand/google.png" alt="Google Logo" />
                  Sign in with Google
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
