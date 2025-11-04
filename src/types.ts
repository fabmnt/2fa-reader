export type APIResponse<T = undefined> =
	| {
			data: T;
			message: string;
	  }
	| {
			error: string;
			details?: string;
	  };
