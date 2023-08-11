const app = {
	name: "Content Judge",
	id: "content-judge",
	version: "1.0.0",
};

var pageLoadStart = Date.now();

function onLoad() {
	// Fix for 100dvh in iOS Web Clip.
	document.body.style.height = "100vh";

	// Check to see if more than a second and a half have passed since the page began loading.
	if (Date.now() - pageLoadStart > 1500) {
		// Animate out the loading screen.
		document.querySelector("#app").style.opacity = 1;
		requestAnimationFrame(function () {
			document.querySelector("#loadingScreen").classList.add("loaded");
		});
	} else {
		setTimeout(onLoad, 100);
	}
}
window.addEventListener("load", onLoad);
