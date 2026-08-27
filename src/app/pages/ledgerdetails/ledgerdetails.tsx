import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FiArrowLeft,
  FiRefreshCw,
  // FiCalendar,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { Search } from "lucide-react";
import { RiFileExcel2Fill } from "react-icons/ri";
import { DatePicker } from "@/components/shared/form/Datepicker";
import apiHelper from "@/utils/apiHelper";
import { Group } from "@/app/layouts/Sideblock/Sidebar/Menu/Group";
// interface Transaction {
//   id: number;
//   date: string;
//   voucher: string;
//   type: string;
//   particulars: string;
//   debit: number;
//   credit: number;
//   balance: number;
// }

const LedgerDetails: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [fromDate, setFromDate] = useState<any>(null);
  const [toDate, setToDate] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [summary, setSummary] = useState({
    openingBalance: 0,
    totalDebit: 0,
    totalCredit: 0,
    closingBalance: 0,
  });
  const accountId = location.state?.accountId;
  const accountName = location.state?.accountName;

  const filterData = location.state?.filterData;

  const totalDebit = transactions.reduce((sum, t) => sum + t.debit, 0);
  const totalCredit = transactions.reduce((sum, t) => sum + t.credit, 0);
  const totalBalance =
    transactions.length > 0 ? transactions[transactions.length - 1].balance : 0;

  const [appliedFromDate, setAppliedFromDate] = useState<any>(null);
  const [appliedToDate, setAppliedToDate] = useState<any>(null);
  // Pagination
  // NEW: filter transactions by the search box
  const filteredTransactions = transactions.filter((t) => {
    const q = search.toLowerCase();
    return (
      String(t.particulars ?? "")
        .toLowerCase()
        .includes(q) ||
      String(t.voucherNo ?? "")
        .toLowerCase()
        .includes(q) ||
      String(t.billNo ?? "")
        .toLowerCase()
        .includes(q) ||
      String(t.type ?? "")
        .toLowerCase()
        .includes(q)
    );
  });

  // Pagination — now based on filteredTransactions
  const totalItems = filteredTransactions.length;
  const totalPages = Math.ceil(totalItems / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentData = filteredTransactions.slice(startIndex, endIndex);
  const [accountInfo, setAccountInfo] = useState({
    accountName: "",
    group: "",
    openingBalance: 0,
    drCr: "",
  });
  const convertDate = (date: any) => {
    if (!date) return "";

    // Already yyyy-mm-dd
    if (typeof date === "string" && date.includes("-")) {
      const parts = date.split("-");

      if (parts[0].length === 4) {
        return date;
      }

      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }

    // Date object
    const d = new Date(date);

    return d.toISOString().split("T")[0];
  };
  // useEffect(() => {
  //   if (filterData) {
  //     setFromDate(filterData.fromDate);
  //     setToDate(filterData.toDate);
  //   }
  // }, [filterData]);
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);
  useEffect(() => {
    if (filterData) {
      setFromDate(filterData.fromDate);
      setToDate(filterData.toDate);

      setAppliedFromDate(filterData.fromDate);
      setAppliedToDate(filterData.toDate);
    }
  }, [filterData]);
  useEffect(() => {
    if (accountId && appliedFromDate && appliedToDate) {
      getLedger();
    }
  }, [accountId, appliedFromDate, appliedToDate]);
  const getLedger = async () => {
    try {
      setLoading(true);

      const res = await apiHelper.get(`/ledger/details/${accountId}`, {
        fromDate: convertDate(appliedFromDate),
        toDate: convertDate(appliedToDate),
      });

      const data = res.transactions || res.data.transactions;
      const account = res.account || res.data.account;

      setTransactions(data);

      if (account) {
        setAccountInfo({
          accountName: account.accountName,
          group: account.group,
          openingBalance: Number(account.openingBalance || 0),
          drCr: account.drCr,
        });
      }

      setTransactions(data);

      let debit = 0;
      let credit = 0;

      data.forEach((item: any) => {
        debit += Number(item.debit || 0);
        credit += Number(item.credit || 0);
      });

      setSummary({
        openingBalance: data[0]?.balance || 0,
        totalDebit: debit,
        totalCredit: credit,
        closingBalance: data[data.length - 1]?.balance || 0,
      });
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accountId && fromDate && toDate) {
      getLedger();
    }
  }, [accountId, fromDate, toDate]);
  // useEffect(() => {
  //   if (accountId) {
  //     getLedger();
  //   }
  // }, [accountId]);
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      }
    }
    return pages;
  };

  const handleBack = () => {
    navigate("/ledgerdetails/ledgerreport");
  };
  const clearFilter = () => {
    setFromDate(filterData.fromDate);
    setToDate(filterData.toDate);

    setTimeout(() => {
      getLedger();
    }, 0);
  };
  const downloadExcel = async () => {
    const blob = await apiHelper.getBlob(
      `/ledger/details/${accountId}/export`,
      {
        fromDate: convertDate(fromDate),
        toDate: convertDate(toDate),
      },
    );

    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${accountName}_Ledger.xlsx`;
    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(url);
  };
  return (
    <div className="dark:bg-dark-800 min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col items-start justify-between md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {accountName.toUpperCase()}
          </h1>
          <p className="dark:text-dark-300 mt-1 text-sm text-gray-500">
            {accountInfo.group} · Opening: ₹
            {accountInfo.openingBalance.toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{" "}
            {accountInfo.drCr}
          </p>
        </div>
        <button
          className="bg-primary-500 hover:bg-primary-600 mt-3 flex cursor-pointer items-center gap-2 rounded-lg px-5 py-2 text-sm font-medium text-white transition-all md:mt-0"
          onClick={handleBack}
        >
          <FiArrowLeft size={18} />
          Back
        </button>
      </div>

      {/* Filters */}
      <div className="mb-5 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              From
            </span>
            <div className="w-36">
              <DatePicker
                placeholder="From Date"
                value={fromDate}
                onChange={setFromDate}
                options={{ disableMobile: true }}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              To
            </span>
            <div className="w-36">
              <DatePicker
                placeholder="To Date"
                value={toDate}
                onChange={setToDate}
                options={{ disableMobile: true }}
              />
            </div>
          </div>
          <button
            onClick={() => {
              setAppliedFromDate(fromDate);
              setAppliedToDate(toDate);
            }}
            className="cursor-pointer rounded-lg bg-red-500 px-4 py-1.5 text-sm font-medium text-white transition-all hover:bg-red-600"
          >
            Apply
          </button>
          <button
            onClick={clearFilter}
            className="bg-primary-500 hover:bg-primary-600 cursor-pointer rounded-lg px-4 py-1.5 text-sm font-medium text-white transition-all"
          >
            Clear
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={downloadExcel}
            className="dark:border-dark-600 dark:bg-dark-700 dark:hover:bg-dark-600 flex h-9.5 w-9.5 cursor-pointer items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 dark:text-gray-300"
          >
            <RiFileExcel2Fill className="text-lg text-green-500" />
          </button>
          <button className="dark:border-dark-600 dark:bg-dark-700 dark:hover:bg-dark-600 flex h-9.5 w-9.5 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 dark:text-gray-300">
            <FiRefreshCw className="text-gray-500" />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-xl bg-blue-50 p-4 dark:bg-blue-900/20">
          <div className="text-sm text-gray-500">Opening Balance</div>
          <div className="text-xl font-bold text-blue-600">
            ₹{summary.openingBalance.toFixed(2)}
          </div>
        </div>

        <div className="rounded-xl bg-green-50 p-4 dark:bg-green-900/20">
          <div className="text-sm text-gray-500">Total Debit</div>
          <div className="text-xl font-bold text-green-600">
            ₹{summary.totalDebit.toFixed(2)}
          </div>
        </div>

        <div className="rounded-xl bg-yellow-50 p-4 dark:bg-yellow-900/20">
          <div className="text-sm text-gray-500">Total Credit</div>
          <div className="text-xl font-bold text-yellow-600">
            ₹{summary.totalCredit.toFixed(2)}
          </div>
        </div>

        <div className="rounded-xl bg-purple-50 p-4 dark:bg-purple-900/20">
          <div className="text-sm text-gray-500">Closing Balance</div>
          <div className="text-xl font-bold text-purple-600">
            ₹{summary.closingBalance.toFixed(2)}
          </div>
        </div>
      </div>
      {/* Search */}
      <div className="relative mb-5 w-full max-w-md">
        <Search className="absolute top-1/2 left-3 size-4.5 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search particulars, voucher, type..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="dark:border-dark-500 dark:bg-dark-800 w-full rounded-lg border border-gray-300 bg-white py-2.5 pr-4 pl-10 text-sm outline-none"
        />
      </div>
      {/* Table */}
      <div className="dark:bg-dark-700 dark:border-dark-600 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="dark:bg-dark-600 bg-gray-50">
              <tr className="whitespace-nowrap">
                <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  #
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Bill No
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Voucher
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Particulars
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Debit
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Credit
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Balance
                </th>
              </tr>
            </thead>
            <tbody className="dark:divide-dark-600 divide-y divide-gray-100">
              {currentData.map((item, index) => (
                <tr
                  key={item.id}
                  className="dark:hover:bg-dark-600 whitespace-nowrap transition-colors hover:bg-gray-50"
                >
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                    {startIndex + index + 1}
                  </td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                    {item.date
                      ? new Date(item.date).toLocaleDateString("en-GB")
                      : "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                    {item.billNo}
                  </td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                    {item.voucherNo}
                  </td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                    {item.type}
                  </td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                    {item.particulars}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">
                    {item.debit.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">
                    {item.credit === 0 ? "—" : item.credit.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">
                    {item.balance.toFixed(2)} DR
                  </td>
                </tr>
              ))}

              {/* Total Row - Inside Table */}

              <tr className="dark:bg-dark-600 bg-gray-50 font-semibold">
                <td className="px-4 py-3 text-gray-900 dark:text-white">
                  TOTAL
                </td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300"></td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300"></td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300"></td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300"></td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300"></td>
                <td className="px-4 py-3 text-right text-green-600 dark:text-green-400">
                  {totalDebit.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-right text-red-500 dark:text-red-400">
                  {totalCredit.toFixed(2)}
                </td>
                <td className="text-primary-500 dark:text-primary-400 px-4 py-3 text-right">
                  {totalBalance.toFixed(2)} Dr
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 0 && (
          <div className="dark:border-dark-700 dark:bg-dark-800 flex flex-col gap-4 border-t border-gray-200 bg-white px-4 py-4 md:flex-row md:items-center">
            <div className="order-1 flex items-center justify-center gap-2 text-sm text-gray-600 md:w-1/3 md:justify-start dark:text-gray-400">
              <span>Show</span>
              <span className="font-medium">{rowsPerPage}</span>
              <span>entries</span>
            </div>

            <div className="order-2 flex justify-center md:w-1/3">
              <div className="dark:border-dark-700 dark:bg-dark-800 inline-flex items-center space-x-1 rounded-lg border border-gray-200 bg-white p-1 shadow-sm">
                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="dark:hover:bg-dark-700 inline-flex size-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent dark:text-gray-400"
                >
                  <FiChevronLeft className="size-4" />
                </button>

                {getPageNumbers().map((page, index) =>
                  typeof page === "number" ? (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      className={`inline-flex size-8 items-center justify-center rounded-md text-sm font-medium transition-colors ${
                        page === currentPage
                          ? "bg-primary-600 text-white"
                          : "dark:hover:bg-dark-700 text-gray-600 hover:bg-gray-100 dark:text-gray-300"
                      }`}
                    >
                      {page}
                    </button>
                  ) : (
                    <span
                      key={index}
                      className="inline-flex size-8 items-center justify-center text-sm text-gray-400 dark:text-gray-500"
                    >
                      {page}
                    </span>
                  ),
                )}

                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="dark:hover:bg-dark-700 inline-flex size-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent dark:text-gray-400"
                >
                  <FiChevronRight className="size-4" />
                </button>
              </div>
            </div>

            <div className="order-3 flex items-center justify-center text-sm text-gray-500 select-none md:w-1/3 md:justify-end dark:text-gray-400">
              <span>
                {totalItems === 0 ? 0 : startIndex + 1} -{" "}
                {Math.min(endIndex, totalItems)} of {totalItems} entries
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LedgerDetails;
