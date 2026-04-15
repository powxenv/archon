import { createFileRoute } from "@tanstack/react-router";
import SolarStarAngleLineDuotone from "~icons/solar/star-angle-line-duotone";
import { Button } from "@heroui/react";
import SolarArrowRightLineDuotone from "~icons/solar/arrow-right-line-duotone";
import SolarDocumentLineDuotone from "~icons/solar/document-line-duotone";
import SolarStarsLineLineDuotone from "~icons/solar/stars-line-line-duotone";
import SolarUsersGroupTwoRoundedLineDuotone from "~icons/solar/users-group-two-rounded-line-duotone";

export const Route = createFileRoute("/")({ component: App });

function App() {
  return (
    <>
      <main>
        <div className="inner border-x min-h-lvh justify-center flex-col flex py-24">
          <div className="max-w-xl text-center mx-auto flex flex-col items-center gap-4">
            <div className="py-1 text-sm pl-2 pr-4 rounded-lg border flex items-center gap-1">
              <SolarStarAngleLineDuotone />
              Lorem ipsum dolor sit amet.
            </div>
            <h1 className="text-5xl font-semibold">
              Lorem, ipsum dolor sit amet consectetur adipisicing elit.
            </h1>
            <p className="max-w-md text-lg">
              Lorem ipsum dolor, sit amet consectetur adipisicing elit. Ut
              tenetur quo explicabo consequuntur perferendis eos natus, dolore
              quidem architecto incidunt nesciunt.
            </p>

            <Button>
              Get Started <SolarArrowRightLineDuotone />
            </Button>
          </div>

          <div className="px-8 grid grid-cols-3 gap-4 mt-8">
            <div className="rotate-2 border p-1 rounded-2xl border-border/50">
              <div className="border p-6 rounded-xl bg-white shadow-xl shadow-black/6">
                <div className="size-10 border flex justify-center items-center rounded-lg">
                  <SolarDocumentLineDuotone />
                </div>
                <h3 className="text-lg my-1">Lorem ipsum dolor sit amet.</h3>
                <p>
                  Lorem ipsum dolor sit amet consectetur, adipisicing elit.
                  Aliquid ratione quas.
                </p>
              </div>
            </div>

            <div className="-rotate-4 border p-1 rounded-2xl border-border/50">
              <div className="border p-6 rounded-xl bg-white shadow-xl shadow-black/6">
                <div className="size-10 border flex justify-center items-center rounded-lg">
                  <SolarStarsLineLineDuotone />
                </div>
                <h3 className="text-lg my-1">Lorem ipsum dolor sit amet.</h3>
                <p>
                  Lorem ipsum dolor sit amet consectetur, adipisicing elit.
                  Aliquid ratione quas.
                </p>
              </div>
            </div>

            <div className="rotate-6 border p-1 rounded-2xl border-border/50">
              <div className="border p-6 rounded-xl bg-white shadow-xl shadow-black/6">
                <div className="size-10 border flex justify-center items-center rounded-lg">
                  <SolarUsersGroupTwoRoundedLineDuotone />
                </div>
                <h3 className="text-lg my-1">Lorem ipsum dolor sit amet.</h3>
                <p>
                  Lorem ipsum dolor sit amet consectetur, adipisicing elit.
                  Aliquid ratione quas.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
