// src/app/pages/allot/AccessoryPurchaseHistory.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeftIcon, CheckIcon } from "@heroicons/react/24/outline";
import { Table, THead, TBody, Tr, Th, Td } from "@/components/ui/Table";
import apiHelper from "@/utils/apiHelper";
import { toast } from "sonner";

interface PurchaseHistoryItem {
  id: number;
  purchaseId: number;
  purchaseBillNo: string;
  billNo: string;
  inwardDate: string | null;
  stock: number;
  status: string;
}

interface AccessoryPurchaseHistoryProps {
  allotmentId: string; // The allotment ID from URL params
  itemId: number; // The accessory item ID
  onClose: () => void; // Close handler
}

const AccessoryPurchaseHistory: React.FC<AccessoryPurchaseHistoryProps> = ({
  allotmentId,
  itemId,
  onClose,
}) => {
  const navigate = useNavigate();

  const [history, setHistory] = useState<PurchaseHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await apiHelper.get(
        `/accessories-purchase/history/${itemId}`,
      );
      setHistory(res.data || res.data || []);
    } catch (error) {
      console.error("Failed to fetch purchase history:", error);
      toast.error("Failed to load purchase history");
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (itemId) {
      fetchHistory();
    }
  }, [itemId]);

  // Action: is purchase stock ko current allotment se allot/link karna
  const handleAllot = async (historyItemId: number) => {
  try {
    await apiHelper.patch(
      `/orders/accessories-allot/${allotmentId}/item/${itemId}/allot`,
      {
        purchaseHistoryId: historyItemId,
      }
    );

    toast.success("Stock allotted successfully");

    fetchHistory();

    // Optional: close modal after successful allotment
    // onClose();

  } catch (error: any) {
    console.error(error);
    toast.error(
      error.response?.data?.message || "Failed to allot stock"
    );
  }
};

  const handleBack = () => {
    onClose(); // Call the close handler instead of navigating
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/50" onClick={handleBack} />
      <div className="absolute top-0 right-0 h-full w-full max-w-3xl transform bg-white shadow-2xl transition-transform sm:w-3/4 lg:w-1/2 dark:bg-gray-800">
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 sm:px-6 sm:py-4 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <button
                onClick={handleBack}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <ArrowLeftIcon className="size-5" />
              </button>
              <h2 className="text-lg font-bold text-blue-600 dark:text-blue-400">
                Accessories Purchase Stock History
              </h2>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {loading ? (
              <div className="flex h-40 items-center justify-center text-gray-500">
                Loading...
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                <Table hoverable className="w-full text-left">
                  <THead className="bg-gray-100 dark:bg-gray-700">
                    <Tr>
                      <Th className="py-3 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                        Purchase Bill No
                      </Th>
                      <Th className="py-3 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                        Inward Date
                      </Th>
                      <Th className="py-3 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                        Stock
                      </Th>
                      <Th className="py-3 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                        Action
                      </Th>
                    </Tr>
                  </THead>
                  <TBody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {history.map((h) => (
                      <Tr key={h.id}>
                        <Td className="py-3">
                          { h.billNo}
                        </Td>
                        <Td className="py-3">
                          {h.inwardDate
                            ? new Date(h.inwardDate).toLocaleDateString(
                                "en-GB",
                              )
                            : "-"}
                        </Td>
                        <Td className="py-3">{h.stock}</Td>
                        <Td className="py-3">
                          <button
                            onClick={() => handleAllot(h.id)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-green-600 text-white hover:bg-green-700"
                            title="Allot this stock"
                          >
                            <CheckIcon className="h-4 w-4" />
                          </button>
                        </Td>
                      </Tr>
                    ))}

                    {history.length === 0 && (
                      <Tr>
                        <Td
                          colSpan={4}
                          className="py-8 text-center text-gray-400"
                        >
                          No inward purchase found for this accessory
                        </Td>
                      </Tr>
                    )}
                  </TBody>
                </Table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessoryPurchaseHistory;