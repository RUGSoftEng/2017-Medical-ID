var settings = {
	parameters: {},
	printParameters: function() {
		Object.keys(settings.parameters).forEach(function(key) {
			value = settings.parameters[key];
			console.log(key + " : " + value);
		});
	}
};

process.argv.forEach(function(parameter, index) {
	if (index > 1) {
		parameter = parameter.split('=');
		if (parameter.length == 1) {
			settings.parameters[parameter[0]] = true;
		} else {
			settings.parameters[parameter[0]] = parameter.slice(1).join('=');
		}
	}
});

module.exports = settings;