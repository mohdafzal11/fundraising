"use client";

import { useState, useEffect, useRef } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { format, addMonths, subMonths } from "date-fns";
import { cn } from "@/lib/theme";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


interface DateTimePickerProps {
    date: Date | undefined;
    setDate: (date: Date | undefined) => void;
    label?: string;
    className?: string;
}


export function DateTimePicker({
    date,
    setDate,
    label,
    className,
}: DateTimePickerProps) {
    const [selectedHours, setSelectedHours] = useState<number>(date ? date.getHours() % 12 || 12 : 12);
    const [selectedMinutes, setSelectedMinutes] = useState<number>(date ? date.getMinutes() : 0);
    const [period, setPeriod] = useState<"AM" | "PM">(date ? (date.getHours() >= 12 ? "PM" : "AM") : "AM");
    const [calendarView, setCalendarView] = useState<"calendar" | "year">("calendar");
    const [currentMonth, setCurrentMonth] = useState<Date>(date || new Date());
    
    // Use refs to track previous values
    const prevHoursRef = useRef(selectedHours);
    const prevMinutesRef = useRef(selectedMinutes);
    const prevPeriodRef = useRef(period);
    const isInitialRender = useRef(true);
    const userChangedTime = useRef(false);

    // Update time fields when date changes externally
    useEffect(() => {
        if (date && !userChangedTime.current) {
            const hours = date.getHours();
            const displayHours = hours % 12 || 12;
            
            if (displayHours !== selectedHours) {
                setSelectedHours(displayHours);
            }
            
            if (date.getMinutes() !== selectedMinutes) {
                setSelectedMinutes(date.getMinutes());
            }
            
            const newPeriod = hours >= 12 ? "PM" : "AM";
            if (newPeriod !== period) {
                setPeriod(newPeriod);
            }

            // Update current month based on date
            setCurrentMonth(date);
        }
        
        if (isInitialRender.current) {
            isInitialRender.current = false;
        } else {
            userChangedTime.current = false;
        }
    }, [date]);

    // Effect to update the date when time components change
    useEffect(() => {
        // Skip the first render or when date is undefined
        if (isInitialRender.current || !date) {
            return;
        }
        
        // Only update if time values actually changed by user
        if (
            selectedHours !== prevHoursRef.current ||
            selectedMinutes !== prevMinutesRef.current ||
            period !== prevPeriodRef.current
        ) {
            userChangedTime.current = true;
            
            const newDate = new Date(date);
            const hours = period === "PM" && selectedHours !== 12
                ? selectedHours + 12
                : (period === "AM" && selectedHours === 12 ? 0 : selectedHours);
                
            newDate.setHours(hours, selectedMinutes, 0, 0);
            setDate(newDate);
            
            // Update refs to current values
            prevHoursRef.current = selectedHours;
            prevMinutesRef.current = selectedMinutes;
            prevPeriodRef.current = period;
        }
    }, [selectedHours, selectedMinutes, period, date, setDate]);

    const handleDateSelect = (selectedDate: Date | undefined) => {
        if (!selectedDate) {
            setDate(undefined);
            return;
        }

        // Keep the time currently selected in the dropdowns
        const hours = period === "PM" && selectedHours !== 12
            ? selectedHours + 12
            : (period === "AM" && selectedHours === 12 ? 0 : selectedHours);
            
        selectedDate.setHours(hours, selectedMinutes, 0, 0); // Set hours, minutes, and reset seconds/ms

        setDate(selectedDate); // Update the state with the new date and the selected time
    };

    const handleHoursChange = (value: string) => {
        const newHours = parseInt(value);
        setSelectedHours(newHours);
        prevHoursRef.current = newHours;
        userChangedTime.current = true;
    };

    const handleMinutesChange = (value: string) => {
        const newMinutes = parseInt(value);
        setSelectedMinutes(newMinutes);
        prevMinutesRef.current = newMinutes;
        userChangedTime.current = true;
    };

    const handlePeriodChange = (value: string) => {
        const newPeriod = value as "AM" | "PM";
        setPeriod(newPeriod);
        prevPeriodRef.current = newPeriod;
        userChangedTime.current = true;
    };

    // Generate arrays for display
    const hours = Array.from({ length: 12 }, (_, i) => i + 1);
    const minutes = Array.from({ length: 12 }, (_, i) => i * 5);
    
    // Generate years for year picker (current year ± 100 years)
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 201 }, (_, i) => currentYear - 100 + i);

    // Handle year selection
    const handleYearSelect = (year: number) => {
        const newDate = new Date(currentMonth);
        newDate.setFullYear(year);
        setCurrentMonth(newDate);
        
        if (date) {
            const updatedDate = new Date(date);
            updatedDate.setFullYear(year);
            setDate(updatedDate);
        }
        
        setCalendarView("calendar");
    };

    // Navigation handlers
    const goToPreviousMonth = () => {
        setCurrentMonth(prevMonth => subMonths(prevMonth, 1));
    };

    const goToNextMonth = () => {
        setCurrentMonth(prevMonth => addMonths(prevMonth, 1));
    };

    const months = [
        "January", "February", "March", "April", "May", "June", 
        "July", "August", "September", "October", "November", "December"
    ];

    // Custom calendar header
    const renderCalendarHeader = () => (
        <div className="flex justify-between items-center px-4 pt-4 pb-2">
            <Button
                variant="ghost"
                size="icon"
                onClick={goToPreviousMonth}
                className="h-7 w-7"
            >
                <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <Button
                variant="ghost"
                onClick={() => setCalendarView("year")}
                className="text-sm font-medium"
            >
                {format(currentMonth, "MMMM yyyy")}
            </Button>
            
            <Button
                variant="ghost"
                size="icon"
                onClick={goToNextMonth}
                className="h-7 w-7"
            >
                <ChevronRight className="h-4 w-4" />
            </Button>
        </div>
    );

    // Auto-scroll to selected year when year view opens
    useEffect(() => {
        if (calendarView === "year") {
            setTimeout(() => {
                const selectedYearElement = document.getElementById("selected-year");
                if (selectedYearElement) {
                    selectedYearElement.scrollIntoView({ 
                        block: "center", 
                        behavior: "smooth" 
                    });
                }
            }, 10);
        }
    }, [calendarView]);

    return (
        <div className={cn("flex flex-col space-y-2", className)}>
            {label && <div className="text-sm text-muted-foreground">{label}</div>}
            <div className="flex gap-2">
                <div className="flex-1">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={cn(
                                    "w-full justify-start text-left font-normal h-12",
                                    !date && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date ? format(date, "dd/MM/yyyy, hh:mm aa") : "dd/mm/yyyy, --:-- --"}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            {calendarView === "calendar" && (
                                <>
                                    {renderCalendarHeader()}
                                    <Calendar
                                        mode="single"
                                        selected={date}
                                        onSelect={handleDateSelect}
                                        initialFocus
                                        month={currentMonth}
                                        onMonthChange={setCurrentMonth}
                                        showOutsideDays={true}
                                        fixedWeeks={true}
                                        className="rounded-md border calendar-no-header"
                                        components={{
                                            Head: () => <></>,
                                            HeadRow: () => <></>,
                                        }}
                                    />
                                </>
                            )}
                            {calendarView === "year" && (
                                <div className="p-2">
                                    <div className="flex justify-between items-center mb-4">
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            onClick={() => setCalendarView("calendar")}
                                        >
                                            Back
                                        </Button>
                                        <h2 className="text-sm font-medium">Select Year</h2>
                                        <div className="w-16"></div>
                                    </div>
                                    <div id="year-picker-container" className="grid grid-cols-4 gap-2 h-64 overflow-y-auto p-1">
                                        {years.map((year) => (
                                            <Button
                                                key={year}
                                                id={year === currentMonth.getFullYear() ? "selected-year" : undefined}
                                                variant={currentMonth.getFullYear() === year ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => handleYearSelect(year)}
                                                className="text-center"
                                            >
                                                {year}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <div className="p-3 border-t">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium">Time</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Select
                                        value={selectedHours.toString()}
                                        onValueChange={handleHoursChange}
                                    >
                                        <SelectTrigger className="w-16">
                                            <SelectValue placeholder="Hour" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {hours.map((hour) => (
                                                <SelectItem key={hour} value={hour.toString()}>
                                                    {hour.toString().padStart(2, "0")}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <span>:</span>
                                    <Select
                                        value={selectedMinutes.toString()}
                                        onValueChange={handleMinutesChange}
                                    >
                                        <SelectTrigger className="w-16">
                                            <SelectValue placeholder="Min" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {minutes.map((minute) => (
                                                <SelectItem key={minute} value={minute.toString()}>
                                                    {minute.toString().padStart(2, "0")}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Select
                                        value={period}
                                        onValueChange={handlePeriodChange}
                                    >
                                        <SelectTrigger className="w-16">
                                            <SelectValue placeholder="AM/PM" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="AM">AM</SelectItem>
                                            <SelectItem value="PM">PM</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
            </div>
        </div>
    );
} 