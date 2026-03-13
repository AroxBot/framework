module.exports = {
	name: "error",
	run: () => [
		false,
		{
			reason: "forced_error_example",
			defaultValue: "Precondition blocked: {{reason}}",
		},
	],
};
