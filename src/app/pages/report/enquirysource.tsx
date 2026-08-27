import { Cog, Wrench } from "lucide-react";

const EnquirySource = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="w-full max-w-lg text-center">
        <div className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-2xl bg-blue-50 shadow-sm">
          <Cog
            className="animate-spin text-red-600"
            size={48}
            strokeWidth={2}
            style={{ animationDuration: "8s" }}
          />
          <div className="absolute right-2 bottom-2 rounded-full bg-white p-1 shadow">
            <Wrench className="text-red-500" size={18} strokeWidth={2.5} />
          </div>
        </div>

        <div className="mt-8 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1">
          <span className="h-2 w-2 rounded-full bg-red-500"></span>
          <span className="text-sm font-semibold tracking-wide text-red-500 uppercase">
            Under Construction
          </span>
        </div>

        <h1 className="mt-6 text-5xl font-extrabold text-red-600">
          Coming Soon...!!
        </h1>

        <p className="mt-6 text-lg leading-8 text-gray-600">
          We are currently working hard behind the scenes to upgrade our
          platform. A brand new experience is just around the corner.
        </p>
      </div>
    </div>
  );
};

export default EnquirySource;
