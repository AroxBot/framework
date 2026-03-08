type AutoSetTarget = {
	setName(name: string): unknown;
	setDescription(description: string): unknown;
};

export const applyAutoSet = <T extends AutoSetTarget>(
	target: T,
	key: string
): T => {
	target.setName(key);
	target.setDescription(key);
	return target;
};

export const asCustomBuilder = <T extends object>(
	builder: object,
	ctor: new () => T
): T => {
	if (!(builder instanceof ctor)) {
		Object.setPrototypeOf(builder, ctor.prototype);
	}
	return builder as T;
};
