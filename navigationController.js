const navigationController = {
	navigationStack: ["home", "loadingScreen"],
	get currentScreen() {
		return document.querySelector("#" + this.navigationStack[this.navigationStack.length - 1]);
	},
	navigate: function (id, animationMode) {
		var targetElement = document.querySelector("#" + id);

		// If the target id is a sheet or dialog, simply present it.
		if (targetElement.tagName === "Q-SHEET" || targetElement.tagName === "Q-DIALOG") {
			targetElement.present();
			return;
		}

		var stack = this.navigationStack;
		stack.push(id);
		if (!window.navigator.standalone) {
			history.pushState(
				{
					screen: id,
					stackIndex: stack.length - 1,
				},
				null,
				`#${id}`
			);
		}

		var animationMode = "from right";
		// Check to see if the target screen is a parent of the current screen.
		for (var i = 0; i < stack.length; i++) {
			if (stack[i] === id) {
				animationMode = "from left";
				break;
			}
		}

		// Present the target element using the determined animation mode.
		targetElement.present(animationMode, this.navigationStack.length + 1, this.navigationStack.length);
		if (dismissedScreen) {
			setTimeout(function () {
				document.querySelector("#" + dismissedScreen).dismiss(true);
			}, 400);
		}
	},
};

if (!window.navigator.standalone) {
	// Push an initial state to the browser history.
	history.pushState(
		{
			screen: "home",
			stackIndex: 0,
		},
		null,
		"#home"
	);

	// Listen for browser history back button press.
	window.addEventListener("popstate", function (e) {
		var state = e.state;
		if (state.stackIndex < navigationController.navigationStack.length - 1) {
			navigationController.currentScreen.dismiss();
		}
	});
}
