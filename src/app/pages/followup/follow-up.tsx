import { useParams } from "react-router-dom";
import {
  PhoneIcon,
  WifiIcon,
  NoSymbolIcon,
  ArrowRightIcon,
  ArrowsRightLeftIcon,
  ArrowPathIcon,
  ChatBubbleLeftEllipsisIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useState, Fragment } from "react";
import apiHelper from "@/utils/apiHelper";
import {
  PlusIcon,
  PhoneXMarkIcon,
  SignalSlashIcon,
  PowerIcon,
  XCircleIcon,
  ClockIcon,
  PhoneArrowUpRightIcon,
  EllipsisHorizontalIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { Button, Textarea } from "@/components/ui";
import { DatePicker } from "@/components/shared/form/Datepicker";
import { Timepicker } from "@/components/shared/form/Timepicker";
import { Listbox } from "@/components/shared/form/StyledListbox";
import { toast } from "sonner";
import { toLocalDateString } from "@/utils/date";
import { useNavigate } from "react-router";
const columns = [
  {
    title: "New",
    color: "text-blue-600",
    icon: PlusIcon,
  },
  {
    title: "Connected",
    color: "text-green-600",
    icon: PhoneIcon,
  },
  {
    title: "Not Connected",
    color: "text-red-600",
    icon: PhoneXMarkIcon,
  },
  {
    title: "Busy",
    color: "text-yellow-500",
    icon: SignalSlashIcon,
  },
  {
    title: "Switch Off",
    color: "text-gray-500",
    icon: PowerIcon,
  },
  {
    title: "Rejected",
    color: "text-red-500",
    icon: XCircleIcon,
  },
  {
    title: "Waiting",
    color: "text-indigo-500",
    icon: ClockIcon,
  },
  {
    title: "Out Of Network",
    color: "text-purple-500",
    icon: WifiIcon,
  },
  {
    title: "Call Back",
    color: "text-orange-500",
    icon: PhoneArrowUpRightIcon,
  },
  {
    title: "Other",
    color: "text-slate-500",
    icon: EllipsisHorizontalIcon,
  },
];

export default function Followup() {
  const { id } = useParams();
  const [lead, setLead] = useState<any>(null);
  const [openFollowupModal, setOpenFollowupModal] = useState(false);
  const [nextDate, setNextDate] = useState("");
  const [callTime, setCallTime] = useState("");
  const [callResponse, setCallResponse] = useState<any>(null);
  const [discussion, setDiscussion] = useState("");
  const [followups, setFollowups] = useState<any[]>([]);
  const [expectedPurchaseDate, setExpectedPurchaseDate] = useState<any>(null);
const navigate = useNavigate();
  const [errors, setErrors] = useState({
    expectedPurchaseDate: "",
    nextDate: "",
    callTime: "",
    callResponse: "",
  });
  const validateForm = () => {
    const newErrors = {
      expectedPurchaseDate: "",
      nextDate: "",
      callTime: "",
      callResponse: "",
    };

    let isValid = true;

    if (!lead?.expectedPurchaseDate) {
      newErrors.expectedPurchaseDate = "Expected Purchase Date is required";
      isValid = false;
    }

    if (!nextDate) {
      newErrors.nextDate = "Next Scheduled Date is required";
      isValid = false;
    }

    if (!callTime) {
      newErrors.callTime = "Call Time is required";
      isValid = false;
    }

    if (!callResponse) {
      newErrors.callResponse = "Call Response is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };
  const responseOptions = [
    { label: "Connected", value: "Connected" },
    { label: "Not Connected", value: "Not Connected" },
    { label: "Busy", value: "Busy" },
    { label: "Switch Off", value: "Switch Off" },
    { label: "Rejected", value: "Rejected" },
    { label: "Waiting", value: "Waiting" },
    { label: "Out Of Network", value: "Out Of Network" },
    { label: "Call Back", value: "Call Back" },
    { label: "Other", value: "Other" },
  ];
  const displayFollowups =
    followups.length === 0 && lead
      ? [
          {
            id: lead.id,
            expectedPurchaseDate: lead.expectedPurchaseDate,
            nextScheduledDate: lead.followUpDate,
            callResponse: "New",
          },
        ]
      : followups;
  const fetchFollowups = async () => {
    try {
      const res = await apiHelper.get(`/followup/lead/${id}/latest`);

      setFollowups(res.data || []);
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    if (id) {
      fetchFollowups();
    }
  }, [id]);
  useEffect(() => {
    if (lead?.expectedPurchaseDate) {
      setExpectedPurchaseDate(new Date(lead.expectedPurchaseDate));
    }
  }, [lead]);
  useEffect(() => {
    const fetchLead = async () => {
      try {
        const res = await apiHelper.get(`/leads/${id}`);
        setLead(res.data || res);
      } catch (error) {
        console.error(error);
      }
    };

    if (id) {
      fetchLead();
    }
  }, [id]);
 useEffect(() => {
  if (lead?.followUpDate) {
    setNextDate(toLocalDateString(lead.followUpDate));
  }
}, [lead]);

  const handleSaveFollowup = async () => {
    if (!validateForm()) {
      console.log("VALIDATION FAILED");
      return;
    }

    try {
      const payload = {
        leadId: Number(id),
        expectedPurchaseDate: expectedPurchaseDate
          ? new Date(expectedPurchaseDate).toISOString()
          : null,
        nextScheduledDate: nextDate ? new Date(nextDate).toISOString() : null,
        callTime,
        callResponse: callResponse?.value || callResponse,
        discussion,
      };

      const res = await apiHelper.post("/followup", payload);

      console.log("Saved:", res);

      toast.success("Follow-up added successfully!");

      setOpenFollowupModal(false);
      await fetchFollowups();
      setCallTime("");
      setCallResponse("");
      setDiscussion("");
    } catch (err: any) {
      console.error(err);
      toast.error(
        err.response?.data?.message ||
          "Failed to save follow-up. Please try again.",
      );
    }
  };
  const openFollowupDrawer = (item: any) => {
    setExpectedPurchaseDate(
      item.expectedPurchaseDate ? new Date(item.expectedPurchaseDate) : null,
    );

   setNextDate(
  item.nextScheduledDate
    ? toLocalDateString(item.nextScheduledDate)
    : "",
);

    setCallTime(item.callTime || "");

    setCallResponse(
      responseOptions.find((option) => option.value === item.callResponse) ||
        null,
    );

    setDiscussion(item.discussion || "");

    setOpenFollowupModal(true);
  };
  return (
    <div className="dark:bg-dark-800 min-h-screen p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Follow-up
          </h1>
          <p className="dark:text-dark-300 mt-1 text-sm text-gray-500">
            Lead ID : {id}
          </p>
        </div>

          <button
  onClick={() => history.back()}
  className="bg-primary-500 hover:bg-primary-600 cursor-pointer flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-colors"
>
  <ArrowLeftIcon className="h-4 w-4" />
  <span>Back</span>
</button>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        {columns.map((column) => (
          <div
            key={column.title}
            className="dark:bg-dark-700 dark:border-dark-600 rounded-xl border border-gray-200 bg-white shadow-sm"
          >
            <div className="dark:border-dark-600 flex items-center gap-2 border-b border-gray-200 p-3 font-semibold">
              <column.icon className={`h-5 w-5 ${column.color}`} />
              <span className={column.color}>{column.title}</span>
            </div>

            <div className="min-h-70 p-2">
              {displayFollowups
                .filter((item) => item.callResponse === column.title)
                .map((item) => (
                  <div
                    key={item.id}
                    className="dark:bg-dark-600/50 dark:border-dark-600 mt-3 rounded-lg border border-gray-200 bg-gray-50 p-3 shadow-sm"
                  >
                    <div className="text-primary-500 dark:text-primary-400 mb-2 text-sm font-semibold">
                      Created By : {item.createdBy || "N/A"}
                    </div>

                    <div className="dark:text-dark-200 mb-1 text-sm text-gray-600">
                      EX. Date :{" "}
                      {new Date(item.expectedPurchaseDate).toLocaleDateString(
                        "en-GB",
                      )}
                    </div>

                    <div className="dark:text-dark-200 mb-4 text-sm text-gray-600">
                      F-up Date :{" "}
                      {new Date(item.nextScheduledDate).toLocaleDateString(
                        "en-GB",
                      )}
                    </div>

                    <div className="dark:text-dark-200 mb-4 text-sm text-gray-600">
                      Time : {item.callTime}
                    </div>
                    <div className="mb-3">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs ${
                          lead?.followUpStatus === "Connected"
                            ? "border-green-500 text-green-600"
                            : lead?.followUpStatus === "Busy"
                              ? "border-yellow-500 text-yellow-600"
                              : lead?.followUpStatus === "Rejected"
                                ? "border-red-500 text-red-600"
                                : lead?.followUpStatus === "Call Back"
                                  ? "border-orange-500 text-orange-600"
                                  : "border-blue-500 text-blue-600"
                        }`}
                      >
                        {item.callResponse}
                      </span>
                    </div>
                    <div className="dark:border-dark-600 dark:text-dark-300 mt-18 flex items-center justify-between border-t border-gray-200 pt-2 text-gray-600">
                      <button
                        onClick={() => openFollowupDrawer(item)}
                        className="hover:text-primary-500 dark:hover:text-primary-400 cursor-pointer transition-colors"
                        title="Move"
                      >
                        <ArrowRightIcon className="h-5 w-5" />
                      </button>

                      <button
                        className="hover:text-primary-500 dark:hover:text-primary-400 cursor-pointer transition-colors"
                        title="Transfer"
                      >
                        <ArrowsRightLeftIcon className="h-5 w-5" />
                      </button>

                      <button
                        onClick={() => navigate(`/followups/history/${item.leadId}`)}
                        className="hover:text-primary-500 dark:hover:text-primary-400 cursor-pointer transition-colors"
                        title="Follow Up"
                      >
                        <ArrowPathIcon className="h-5 w-5" />
                      </button>

                      <div className="flex items-center gap-1">
                        <ChatBubbleLeftEllipsisIcon className="hover:text-primary-500 dark:hover:text-primary-400 h-5 w-5 cursor-pointer transition-colors" />

                        <span className="dark:text-dark-400 text-xs text-gray-500">
                          {item.callResponse === "New" ? 1 : item.followupCount}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>

      {/* Slide Transition Form Drawer - Same as ModelYear */}
      <Transition appear show={openFollowupModal} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-100"
          onClose={() => setOpenFollowupModal(false)}
        >
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-900/50 backdrop-blur transition-opacity dark:bg-black/40" />
          </TransitionChild>

          <TransitionChild
            as={Fragment}
            enter="ease-out transform-gpu transition-transform duration-200"
            enterFrom="translate-x-full"
            enterTo="translate-x-0"
            leave="ease-in transform-gpu transition-transform duration-200"
            leaveFrom="translate-x-0"
            leaveTo="translate-x-full"
          >
            <DialogPanel className="dark:bg-dark-700 fixed top-0 right-0 flex h-full w-full max-w-md transform-gpu flex-col bg-white shadow-2xl transition-transform duration-200">
              <form className="flex h-full flex-col">
                {/* Header - Same as ModelYear */}
                <div className="dark:border-dark-500 flex items-center justify-between border-b border-gray-200 px-5 py-4">
                  <h2 className="dark:text-dark-50 text-lg font-semibold text-gray-800">
                    Add Follow-up
                  </h2>
                  <Button
                    onClick={() => setOpenFollowupModal(false)}
                    variant="flat"
                    isIcon
                    className="size-8 rounded-full text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-200"
                    type="button"
                  >
                    <XMarkIcon className="size-5" />
                  </Button>
                </div>

                {/* Content Input Fields - Same spacing and styling as ModelYear */}
                <div className="grow space-y-5 overflow-y-auto p-5">
                  {/* Expected Purchase Date - Readonly */}
                  <div>
                    <label className="dark:text-dark-200 mb-2 block text-sm font-medium text-gray-700">
                      Expected Purchase Date
                    </label>
                    <DatePicker
                      value={expectedPurchaseDate}
                      onChange={(date: any) => setExpectedPurchaseDate(date)}
                    />
                    {errors.expectedPurchaseDate && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.expectedPurchaseDate}
                      </p>
                    )}
                  </div>

                  {/* Next Scheduled Date */}
                  <div>
                    <label className="dark:text-dark-200 mb-2 block text-sm font-medium text-gray-700">
                      Next Scheduled Date
                    </label>
                    <DatePicker
                      value={nextDate}
                      onChange={(date: any) => setNextDate(date)}
                      placeholder="Select Follow-up Date"
                    />
                    {errors.nextDate && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.nextDate}
                      </p>
                    )}
                  </div>

                  {/* Call Time */}
                  <div>
                    <label className="dark:text-dark-200 mb-2 block text-sm font-medium text-gray-700">
                      Call Time
                    </label>
                    <Timepicker
                      value={callTime}
                      onChange={(value: any) => setCallTime(value)}
                    />
                    {errors.callTime && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.callTime}
                      </p>
                    )}
                  </div>

                  {/* Call Response - Dropdown */}
                  <div>
                    <label className="dark:text-dark-200 mb-2 block text-sm font-medium text-gray-700">
                      Call Response
                    </label>
                    <Listbox
                      data={responseOptions}
                      value={callResponse}
                      onChange={setCallResponse}
                      placeholder="Select Call Response"
                    />
                    {errors.callResponse && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.callResponse}
                      </p>
                    )}
                  </div>

                  {/* Call Discussion - Textarea */}
                  <div>
                    <label className="dark:text-dark-200 mb-2 block text-sm font-medium text-gray-700">
                      Call Discussion
                    </label>
                    <Textarea
                      rows={4}
                      value={discussion}
                      onChange={(e) => setDiscussion(e.target.value)}
                      placeholder="Enter discussion..."
                      className="focus:border-primary-500 focus:ring-primary-500/20 dark:border-dark-500 dark:bg-dark-600 dark:placeholder-dark-400 dark:focus:border-primary-400 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition-colors outline-none focus:ring-2 dark:text-white"
                    />
                  </div>
                </div>

                {/* Footer - Same as ModelYear */}
                <div className="dark:border-dark-500 flex items-center justify-end gap-3 border-t border-gray-200 p-5">
                  <Button
                    variant="outlined"
                    color="neutral"
                    type="button"
                    onClick={() => setOpenFollowupModal(false)}
                    className="h-10 w-1/2"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveFollowup}
                    color="primary"
                    type="button"
                    className="h-10 w-1/2"
                  >
                    Save
                  </Button>
                </div>
              </form>
            </DialogPanel>
          </TransitionChild>
        </Dialog>
      </Transition>
    </div>
  );
}
