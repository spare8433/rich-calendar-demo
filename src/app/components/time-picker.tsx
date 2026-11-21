import { Input } from "@/app/components/ui/input";
import { cn } from "@/lib/utils";

export default function TimePicker({ className, ...rest }: React.ComponentProps<"input">) {
  return (
    <Input
      type="time"
      className={cn(
        "w-fit cursor-pointer border border-input bg-background font-normal hover:bg-accent hover:text-accent-foreground",
        className,
      )}
      {...rest}
    />
  );
}
