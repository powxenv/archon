import { initials } from "#/lib/utils";
import { authClient } from "#/lib/client/auth";
import { Avatar, buttonVariants, cn, Dropdown } from "@heroui/react";
import { Link, useNavigate, useRouteContext } from "@tanstack/react-router";
import SolarLogout2Linear from "~icons/solar/logout-2-linear";
import SolarWidget2Linear from "~icons/solar/widget-2-linear";

const Header = () => {
  const { session } = useRouteContext({ from: "__root__" });
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await authClient.signOut();
    void navigate({ to: "/" });
  };

  const handleMenuAction = (key: string) => {
    if (key === "dashboard") {
      void navigate({ to: "/app" });
    } else if (key === "logout") {
      void handleSignOut();
    }
  };

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
            <Dropdown>
              <Dropdown.Trigger>
                <button
                  type="button"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "pl-1 cursor-pointer",
                  )}
                >
                  <Avatar className="size-6 border">
                    <Avatar.Image alt={session.user.name} src={session.user.image || ""} />
                    <Avatar.Fallback>{initials(session.user.name)}</Avatar.Fallback>
                  </Avatar>
                  Open App
                </button>
              </Dropdown.Trigger>
              <Dropdown.Popover>
                <Dropdown.Menu aria-label="User menu" onAction={(key) => handleMenuAction(String(key))}>
                  <Dropdown.Section>
                    <Dropdown.Item id="dashboard" textValue="Dashboard">
                      <span className="flex items-center gap-2">
                        <SolarWidget2Linear className="size-4" />
                        Dashboard
                      </span>
                    </Dropdown.Item>
                    <Dropdown.Item id="logout" textValue="Sign out">
                      <span className="flex items-center gap-2">
                        <SolarLogout2Linear className="size-4" />
                        Sign out
                      </span>
                    </Dropdown.Item>
                  </Dropdown.Section>
                </Dropdown.Menu>
              </Dropdown.Popover>
            </Dropdown>
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
