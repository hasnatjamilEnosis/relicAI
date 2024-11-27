"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Updater } from "@tanstack/react-form";

export function DatePicker({
  id,
  placeholder,
  onChange,
}: {
  id: string;
  placeholder: string;
  onChange: (updater: Updater<string>) => void;
}) {
  const [date, setDate] = React.useState<Date>();
  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false);

  React.useEffect(() => {
    if (date) {
      onChange(
        `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
      );
    }
  }, [date]);

  return (
    <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant={"outline"}
          className={cn(
            "w-96 justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          initialFocus
          onSelect={(e) => {
            setDate(e);
            setIsCalendarOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
