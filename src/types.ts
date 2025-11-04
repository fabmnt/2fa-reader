export type APIResponse<T> =
	| {
			data: T;
			message: string;
	  }
	| {
			error: string;
	  };
