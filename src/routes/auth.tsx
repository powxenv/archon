import { Outlet, redirect } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/auth")({
  beforeLoad: async ({ context }) => {
    const session = context.session;
    if (session) {
      throw redirect({
        to: "/",
      });
    }
  },
  component: () => <Outlet />,
});
