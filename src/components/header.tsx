import { initials } from "#/lib/utils";
import { Avatar, buttonVariants, cn } from "@heroui/react";
import { Link, useRouteContext } from "@tanstack/react-router";

const Header = () => {
  const { session } = useRouteContext({ from: "__root__" });

  return (
    <header className="border-b bg-background/60 inset-x-0 fixed top-0 backdrop-blur-2xl z-10">
      <div className="inner border-x px-8 py-3 flex items-center justify-between relative">
        <div className="size-2 bg-background border absolute bottom-0 left-0 -translate-x-1/2 translate-y-1/2"></div>
        <div className="size-2 bg-background border absolute right-0 bottom-0 translate-x-1/2 translate-y-1/2"></div>

        <Link to="/" className="flex items-center gap-1 text-lg font-semibold">
          <img src="/archon.svg" className="size-6" alt="" />
          Archon
        </Link>
        <nav className="flex gap-4 items-center">
          <Link to="/" className="text-sm hover:underline decoration-wavy">
            Github
          </Link>
          {session ? (
            <Link
              to="/app"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "pl-1")}
            >
              <Avatar className="size-6 border">
                <Avatar.Image alt={session.user.name} src={session.user.image || ""} />
                <Avatar.Fallback>{initials(session.user.name)}</Avatar.Fallback>
              </Avatar>
              Open App
            </Link>
          ) : (
            <Link to="/auth" className={buttonVariants({ variant: "outline", size: "sm" })}>
              Sign In
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
