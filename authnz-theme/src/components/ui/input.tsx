import * as React from "react";

import { cn } from "@/lib/utils";
import { CircleAlert } from "lucide-react";

export interface InputProps
	extends React.InputHTMLAttributes<HTMLInputElement> {
	isError?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
	({ className, type, isError, ...props }, ref) => {
		return (
			<div className="relative">
				<input
					type={type}
					className={cn(
						"flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
						isError
							? "border-red-500 focus-visible:ring-red-500"
							: "",
						className,
					)}
					ref={ref}
					{...props}
					aria-invalid={isError}
				/>
				{isError && (
					<CircleAlert className="h-5 w-auto text-red-500 absolute top-1/4 right-2" />
				)}
			</div>
		);
	},
);
Input.displayName = "Input";

export { Input };
