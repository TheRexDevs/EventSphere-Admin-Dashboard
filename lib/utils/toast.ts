import { toast } from "sonner";

export const showToast = {
	success: (message: string) => {
		toast.success(message, {
			duration: 4000,
			className: "bg-background text-foreground",
		});
	},
	error: (message: string) => {
		toast.error(message, {
			duration: 5000,
			className: "bg-background text-destructive",
		});
	},
	loading: (message: string) => {
		toast.loading(message, {
			className: "bg-background text-foreground",
		});
	},
	promise: async <T>(
		promise: Promise<T>,
		{
			loading = "Loading...",
			success = "Success!",
			error = "Something went wrong",
		}: {
			loading?: string;
			success?: string;
			error?: string;
		}
	) => {
		return toast.promise(promise, {
			loading,
			success,
			error,
		});
	},
};
