import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/app/components/ui/form";
import { Input } from "@/app/components/ui/input";
import { PasswordInput } from "../ui/password-input";


import type { Control, FieldValues, Path } from "react-hook-form";

interface FieldWrapperProps<TFieldValues extends FieldValues = FieldValues> {
	control: Control<TFieldValues>;
	name: Path<TFieldValues>;
	label: string;
	type?: string;
	icon?: React.ReactNode;
	disabled?: boolean;
	placeholder?: string;
	helperText?: string;
	helperTextColor?: string;
}

const FieldWrapper = <TFieldValues extends FieldValues = FieldValues>({
	control,
	name,
	label,
	type = "text",
	icon,
	disabled,
	placeholder,
	helperText,
	helperTextColor = "text-gray-500",
}: FieldWrapperProps<TFieldValues>) => (
	<FormField
		control={control}
		name={name}
		render={({ field }) => (
			<FormItem className="space-y-2.5">
				<FormLabel className={icon ? "flex items-center gap-2" : ""}>
					{icon}
					{label}
				</FormLabel>
				<FormControl>
					{type == "password" ? (
						<PasswordInput
							placeholder={placeholder}
							disabled={disabled}
							{...field}
						/>
					) : (
						<Input
							type={type}
							placeholder={placeholder}
							disabled={disabled}
							{...field}
						/>
					)}
				</FormControl>
				<FormMessage />
				{helperText && (
					<p className={`text-sm ${helperTextColor}`}>
						{helperText}
					</p>
				)}
			</FormItem>
		)}
	/>
);

export default FieldWrapper;
