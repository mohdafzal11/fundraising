"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { Calendar } from "@/components/ui/calendar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DateRangeFilterProps {
  onDateRangeChange: (from: string, to: string) => void;
  initialFrom?: string;
  initialTo?: string;
}

const DateRange = ({
  onDateRangeChange,
  initialFrom = "",
  initialTo = "",
}: DateRangeFilterProps) => {
  const { theme } = useTheme();
  const [from, setFrom] = useState<Date | undefined>(
    initialFrom ? new Date(initialFrom) : undefined
  );
  const [to, setTo] = useState<Date | undefined>(
    initialTo ? new Date(initialTo) : undefined
  );

  const [isOpen, setIsOpen] = useState(false);

  const handlePreset = (type: string) => {
    const today = new Date();
    let start: Date | undefined;
    let end: Date | undefined = new Date();

    switch (type) {
      case "last7":
        start = new Date();
        start.setDate(today.getDate() - 7);
        break;
      case "last30":
        start = new Date();
        start.setDate(today.getDate() - 30);
        break;
      case "thisMonth":
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        break;
      case "lastMonth":
        start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        end = new Date(today.getFullYear(), today.getMonth(), 0);
        break;
      case "1year":
        start = new Date(
          today.getFullYear() - 1,
          today.getMonth(),
          today.getDate()
        );
        break;
      default:
        start = undefined;
        end = undefined;
    }

    setFrom(start);
    setTo(end);

    if (start && end) {
      onDateRangeChange(
        start.toISOString().split("T")[0],
        end.toISOString().split("T")[0]
      );
    }
  };

  const handleApply = () => {
    if (from && to) {
      onDateRangeChange(
        from.toISOString().split("T")[0],
        to.toISOString().split("T")[0]
      );
      setIsOpen(false);
    }
  };

  const handleClear = () => {
    setFrom(undefined);
    setTo(undefined);
    onDateRangeChange("", "");
  };

  return (
    <div className="col-span-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Round Date
      </label>

      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <button
            className={cn(
              " px-3 w-full py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 text-sm flex items-center justify-between"
            )}
          >
            {from && to
              ? `${from.toLocaleDateString()} - ${to.toLocaleDateString()}`
              : "Select Range"}
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          className=" border border-gray-200 dark:border-gray-700 p-4 w-[800px] rounded-lg shadow-lg"
          align="start"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Calendars */}
            <div className="col-span-2 grid grid-cols-2 gap-4">
              <Calendar
                mode="single"
                selected={from}
                onSelect={setFrom}
                className="rounded-md border"
              />
              <Calendar
                mode="single"
                selected={to}
                onSelect={setTo}
                className="rounded-md border"
              />
            </div>

            {/* Presets */}
            <div className="flex flex-col space-y-2">
              <Button variant="ghost" onClick={() => handlePreset("last7")}>
                Last 7 Days
              </Button>
              <Button variant="ghost" onClick={() => handlePreset("last30")}>
                Last 30 Days
              </Button>
              <Button variant="ghost" onClick={() => handlePreset("thisMonth")}>
                This Month
              </Button>
              <Button variant="ghost" onClick={() => handlePreset("lastMonth")}>
                Last Month
              </Button>
              <Button variant="ghost" onClick={() => handlePreset("1year")}>
                1 Year
              </Button>

              <div className="flex gap-2 mt-2">
                <Button
                  variant="secondary"
                  onClick={handleClear}
                  className="flex-1"
                >
                  Clear
                </Button>
                <Button
                  variant="default"
                  onClick={handleApply}
                  className="flex-1"
                >
                  Apply
                </Button>
              </div>
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default DateRange;
