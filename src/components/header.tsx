import { Button, Modal } from "@heroui/react";
import { Link } from "@tanstack/react-router";

const Header = () => {
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
          <Modal>
            <Button variant="outline" size="sm">
              Sign In
            </Button>
            <Modal.Backdrop variant="blur">
              <Modal.Container>
                <Modal.Dialog className="sm:max-w-90">
                  <Modal.CloseTrigger />
                  <Modal.Header>
                    <Modal.Heading className="font-semibold">
                      Welcome to Archon
                    </Modal.Heading>
                  </Modal.Header>
                  <Modal.Body>
                    <p>
                      Sign in to your account and let Archon turn your codebase
                      into clear, structured documentation.
                    </p>
                  </Modal.Body>
                  <Modal.Footer className="flex flex-col gap-1">
                    <Button className="w-full" variant="outline">
                      <img
                        className="size-4"
                        src="/brand/gh.png"
                        alt="Github Logo"
                      />
                      Sign in with Github
                    </Button>

                    <Button className="w-full" variant="outline" isDisabled>
                      <img
                        className="size-4"
                        src="/brand/google.png"
                        alt="Google Logo"
                      />
                      Sign in with Google
                    </Button>
                  </Modal.Footer>
                </Modal.Dialog>
              </Modal.Container>
            </Modal.Backdrop>
          </Modal>
        </nav>
      </div>
    </header>
  );
};

export default Header;
