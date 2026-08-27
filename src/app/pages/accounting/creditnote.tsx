import { Cog, Wrench } from "lucide-react";

const CreditNote = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="max-w-lg w-full text-center">
        <div className="mx-auto w-24 h-24 rounded-2xl bg-blue-50 flex items-center justify-center relative shadow-sm">
          <Cog className="text-red-600 animate-spin" size={48} strokeWidth={2} style={{ animationDuration: "8s" }} />
          <div className="absolute bottom-2 right-2 bg-white rounded-full p-1 shadow">
            <Wrench className="text-red-500" size={18} strokeWidth={2.5} />
          </div>
        </div>

        <div className="inline-flex items-center gap-2 bg-blue-50 px-4 py-1 rounded-full mt-8">
          <span className="w-2 h-2 rounded-full bg-red-500"></span>
          <span className="text-red-500 text-sm font-semibold uppercase tracking-wide">
            Under Construction
          </span>
        </div>

        <h1 className="text-5xl font-extrabold text-red-600 mt-6">
          Coming Soon...!!
        </h1>

        <p className="mt-6 text-gray-600 text-lg leading-8">
          We are currently working hard behind the scenes to upgrade our platform.
          A brand new experience is just around the corner.
        </p>
      </div>
    </div>
  );
};

export default CreditNote;