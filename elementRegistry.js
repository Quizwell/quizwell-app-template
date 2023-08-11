// Define Custom Elements

class FAIcon extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: "open" });
		this.shadowRoot.innerHTML = `
			<link href="/fontawesome/css/fontawesome.css" rel="stylesheet">
			<link href="/fontawesome/css/solid.css" rel="stylesheet">
			<style>
				:host {
					color: inherit;
				}
			</style>
			<i style="font-size: 25px"></i>
		`;
	}
	setupElement() {
		this.shadowRoot.querySelector("i").className = "";
		if (this.getAttribute("icon")) {
			var element = this.shadowRoot.querySelector("i");
			element.classList.add("fa-solid");
			element.classList.add("fa-fw");
			element.classList.add("fa-" + this.getAttribute("icon"));
		}
		if (this.getAttribute("size")) {
			this.shadowRoot.querySelector("i").style.fontSize = this.getAttribute("size");
		}
	}
	connectedCallback() {
		this.setupElement();
	}
	static get observedAttributes() {
		return [];
	}
	attributeChangedCallback(name, oldValue, newValue) {
		// Handle changes to attributes
		this.setupElement();
	}
}
customElements.define("fa-i", FAIcon);

class QAppIcon extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: "open" });
		this.shadowRoot.innerHTML = `
			<style>
				:host {
					display: block;
				}
				:host img {
					width: 80px;
					height: 80px;
					border-radius: 20%;
					box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.2);
				}
			</style>
			<img draggable="false">
		`;
	}
	setupElement() {
		if (this.getAttribute("app")) {
			this.shadowRoot.querySelector("img").src = "/images/apps/" + this.getAttribute("app") + ".png";
		}
		if (this.getAttribute("size")) {
			this.shadowRoot.querySelector("img").style.width = this.getAttribute("size");
			this.shadowRoot.querySelector("img").style.height = this.getAttribute("size");
		}
	}
	connectedCallback() {
		this.setupElement();
	}
	static get observedAttributes() {
		return [];
	}
	attributeChangedCallback(name, oldValue, newValue) {
		// Handle changes to attributes
		this.setupElement();
	}
}
customElements.define("q-app-icon", QAppIcon);

class QScreen extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: "open" });
		this.shadowRoot.innerHTML = `
			<style>
				:host {
					display: block;
					position: absolute;
					top: 0;
					left: 0;
					background: var(--color-background);
					width: var(--width-screen);
					height: var(--height-screen);
					box-shadow: var(--box-shadow-screen);
					transition: transform var(--animation-duration-screen) var(--animation-easing-screen);
				}

				:host(:not([presented])),
				:host(.fromRight:not([presented])) {
					transform: translate(calc(20px + 100%), 0);
				}
				:host(.fromTop:not([presented])) {
					transform: translate(0, calc(20px + -100%));
				}
				:host(.fromBottom:not([presented])) {
					transform: translate(0, calc(20px + 100%));
				}

				:host .background {
					position: absolute;
					top: 0;
					right: 0;
					width: 100%;
					height: 100%;
					overflow: hidden;
				}

				:host .background .image {
					position: absolute;
					top: 0;
					right: 0;
					width: 100%;
					max-width: 500pt;
					background-image: var(--url-gradient);
					background-position: top, right;
					background-size: contain;
					background-repeat: no-repeat;
				}

				:host .background.memory .image,
				:host .background.memory .image .gradients {
					transform: rotate(180deg);
				}

				:host .background .image:after {
					padding-top: 56.25%;
					display: block;
					content: '';
				}

				:host .background .image .gradients {
					position: absolute;
					top: 0;
					left: 0;
					right: 0;
					bottom: 0;
					background-image: linear-gradient(to top, 
					var(--color-background), transparent), linear-gradient(to right,
					var(--color-background), transparent);
				}

				:host .foreground {
					position: absolute;
					top: 0;
					left: 0;
					right: 0;
					bottom: 0;
					padding: var(--padding-screen);
					box-sizing: border-box;
				}

				:host .content {
					height: 100%;
					display: flex;
					flex-direction: column;
					justify-content: flex-start;
					align-items: flex-start;
					gap: 5pt;
				}

				:host .content q-title-bar {
					position: fixed;
					top: var(--inset-top-title-bar);
					left: var(--inset-left-title-bar);
				}
			</style>
			<div class="screen">
				<div class="background">
					<div class="image">
						<div class="gradients">
						</div>
					</div>
				</div>
				<div class="foreground">
					<div class="content">
						<q-title-bar icon="chevron-left"></q-title-bar>
						<slot name="header"></slot>
						<slot></slot>
					</div>
				</div>
			</div>
		`;
		this.present = function (animationMode, transitionZIndex, finalZIndex) {
			// Temporarily disable transitions on the element
			this.style.transition = "none";
			requestAnimationFrame(() => {
				switch (animationMode) {
					case "from right":
						this.classList.add("fromRight");
						break;
					case "from top":
						this.classList.add("fromTop");
						break;
					case "from bottom":
						this.classList.add("fromBottom");
						break;
				}
				if (transitionZIndex) {
					this.style.zIndex = transitionZIndex;
				}
				requestAnimationFrame(() => {
					this.style.removeProperty("transition");
					requestAnimationFrame(() => {
						this.setAttribute("presented", "");
						setTimeout(() => {
							this.classList.remove("fromRight");
							this.classList.remove("fromTop");
							this.classList.remove("fromBottom");
							if (finalZIndex) {
								this.style.zIndex = finalZIndex;
							}
						}, 400);
					});
				});
			});
		};
		this.dismiss = function (transitionMode) {
			if (navigationController.navigationStack[navigationController.navigationStack.length - 1] === this.id) {
				navigationController.navigationStack.pop();
			}

			if (transitionMode === "none") {
				this.style.transition = "none";
			} else if (transitionMode === "user-gesture") {
				this.style.transitionTimingFunction = "cubic-bezier(.17,.67,.89,1.01)";
			}
			requestAnimationFrame(() => {
				this.removeAttribute("presented");
				if (transitionMode) {
					requestAnimationFrame(() => {
						this.style.removeProperty("transition");
						this.style.removeProperty("transition-timing-function");
					});
				} else {
					setTimeout(() => {
						this.style.removeProperty("z-index");
					}, 400);
				}
			});
		};
	}
	setupElement() {
		if (this.getAttribute("initial") !== null) {
			this.shadowRoot.querySelector("q-title-bar").setAttribute("disabled", true);
			this.shadowRoot.querySelector("q-title-bar").removeAttribute("icon");
		} else {
			this.shadowRoot.querySelector("q-title-bar").addEventListener("click", () => {
				this.dismiss();
			});
		}

		requestAnimationFrame(() => {
			const slot = this.shadowRoot.querySelector('slot[name="header"]');
			if (slot.assignedNodes({ flatten: true }).length > 0) {
				this.shadowRoot.querySelector("q-title-bar").remove();
			} else {
				this.shadowRoot.querySelector(".content").style.paddingTop = "var(--padding-screen-top-with-title)";
			}
		});

		this.shadowRoot.querySelector(".background").className = "background";
		if (this.getAttribute("background-type")) {
			this.shadowRoot.querySelector(".background").classList.add(this.getAttribute("background-type"));
		}
		if (this.getAttribute("title")) {
			this.shadowRoot.querySelector("q-title-bar").textContent = this.getAttribute("title");
		}

		if (this.getAttribute("initial") === null) {
			// Detect a touch swipe from the left edge of the screen to the right in order to navigate backwards.
			var element = this;
			var screenElement = this.shadowRoot.querySelector(".screen");
			var touchStartX = 0;
			var touchStartY = 0;
			var touchEndX = 0;
			var touchEndY = 0;
			screenElement.addEventListener("touchstart", function (event) {
				touchStartX = event.touches[0].clientX;
				touchStartY = event.touches[0].clientY;
				if (touchStartX < 10) {
					event.preventDefault();
				}
			});
			screenElement.addEventListener("touchmove", (e) => {
				touchEndX = e.changedTouches[0].clientX;
				touchEndY = e.changedTouches[0].clientY;
				// Start animating the screen's position in sync with the gesture.
				if (touchStartX < 10 && touchEndX > touchStartX) {
					element.style.transition = "none";
					requestAnimationFrame(() => {
						element.style.transform = `translate(${touchEndX}px, 0)`;
					});
				}
			});
			screenElement.addEventListener("touchend", function (event) {
				touchEndX = event.changedTouches[0].clientX;
				touchEndY = event.changedTouches[0].clientY;

				if (touchStartX < 10) {
					element.style.removeProperty("transition");
					requestAnimationFrame(() => {
						element.style.removeProperty("transform");
						if (touchEndX - touchStartX > 100) {
							if (navigationController.navigationStack.length > 1) {
								element.dismiss("user-gesture");
							}
						}
					});
				}
			});
		}
	}
	connectedCallback() {
		this.setupElement();
	}
	static get observedAttributes() {
		return [];
	}
	attributeChangedCallback(name, oldValue, newValue) {
		// Handle changes to attributes
		this.setupElement();
	}
}
customElements.define("q-screen", QScreen);

class QSheet extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: "open" });
		this.shadowRoot.innerHTML = `
			<style>
				:host {
					display: block;
				}
				:host .overlay {
					position: fixed;
					top: 0;
					left: 0;
					right: 0;
					bottom: 0;
					background: var(--color-overlay);
					opacity: var(--opacity-overlay);
					cursor: pointer;
					z-index: var(--z-index-overlay);
					transition: opacity var(--animation-duration-sheet) var(--animation-easing-sheet);
				}
				:host(:not([presented])) .overlay {
					opacity: 0;
					pointer-events: none;
				}

				:host .sheet {
					display: block;
					position: absolute;
					bottom: 0;
					left: 0;
					right: 0;
					border-radius: var(--border-radius-sheet);
					background: var(--color-background);
					width: var(--width-sheet);
					height: var(--height-sheet);
					padding: var(--padding-sheet);
					min-height: var(--height-sheet-min);
					max-height: var(--height-sheet-max);
					box-shadow: var(--box-shadow-sheet);
					box-sizing: border-box;
					overflow-y: auto;
					z-index: var(--z-index-sheet);
					transition: transform var(--animation-duration-sheet) var(--animation-easing-sheet);
				}
				:host(:not([presented])) .sheet {
					transform: translate(0, 100%);
				}
				@media (min-width: 600px) {
					:host .sheet {
						min-width: var(--width-sheet-desktop-min);
						max-width: var(--width-sheet-desktop-max);
						top: 50%;
						left: 50%;
						bottom: auto;
						border-radius: var(--border-radius-sheet-desktop);
						transform: translate(-50%, -50%);
						transition: opacity var(--animation-duration-sheet) var(--animation-easing-sheet), transform var(--animation-duration-sheet) var(--animation-easing-sheet);
					}
					:host(:not([presented])) .sheet {
						transform: translate(-50%, 20%);
						opacity: 0;
						pointer-events: none;
					}
				}

				:host .sheet .content {
					display: flex;
					flex-direction: column;
					justify-content: flex-start;
					align-items: flex-start;
					gap: 5pt;
				}
			</style>
			<div class="overlay"></div>
			<div class="sheet">
				<q-title></q-title>
				<div class="content">
					<slot></slot>
				</div>
			</div>
		`;
		this.present = function () {
			this.setAttribute("presented", "");
		};
		this.dismiss = function () {
			this.removeAttribute("presented");
		};
	}
	setupElement() {
		this.shadowRoot.querySelector(".overlay").addEventListener("click", () => {
			this.dismiss();
		});
		if (this.getAttribute("title")) {
			this.shadowRoot.querySelector("q-title").textContent = this.getAttribute("title");
		}
		// When the user scrolls slides down on the sheet on mobile, dismiss the sheet.
		var sheet = this.shadowRoot.querySelector(".sheet");
		var touchStartX = 0;
		var touchStartY = 0;
		var touchEndX = 0;
		var touchEndY = 0;
		sheet.addEventListener("touchstart", (e) => {
			touchStartX = e.changedTouches[0].screenX;
			touchStartY = e.changedTouches[0].screenY;
		});
		sheet.addEventListener("touchmove", (e) => {
			touchEndX = e.changedTouches[0].screenX;
			touchEndY = e.changedTouches[0].screenY;
			// If the sheet scrolling is at the very top, start animating the sheet down with the gesture.
			if (sheet.scrollTop === 0) {
				if (touchEndY - touchStartY > 0) {
					sheet.style.transition = "none";
					requestAnimationFrame(() => {
						sheet.style.transform = `translate(0, ${touchEndY - touchStartY}px)`;
					});
				}
			}
		});
		sheet.addEventListener("touchend", (e) => {
			touchEndX = e.changedTouches[0].screenX;
			touchEndY = e.changedTouches[0].screenY;
			if (sheet.scrollTop <= 0) {
				sheet.style.removeProperty("transition");
				requestAnimationFrame(() => {
					sheet.style.removeProperty("transform");
					if (touchEndY - touchStartY > 150) {
						this.dismiss();
					}
				});
			}
		});
	}
	connectedCallback() {
		this.setupElement();
	}
	static get observedAttributes() {
		return [];
	}
	attributeChangedCallback(name, oldValue, newValue) {
		// Handle changes to attributes
		this.setupElement();
	}
}
customElements.define("q-sheet", QSheet);

class QDialog extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: "open" });
		this.shadowRoot.innerHTML = `
			<style>
				:host {
					display: block;
				}
				:host .overlay {
					position: fixed;
					top: 0;
					left: 0;
					right: 0;
					bottom: 0;
					background: var(--color-overlay);
					opacity: var(--opacity-overlay);
					cursor: pointer;
					z-index: var(--z-index-overlay);
					transition: opacity var(--animation-duration-dialog) var(--animation-easing-dialog);
				}
				:host(:not([presented])) .overlay {
					opacity: 0;
					pointer-events: none;
				}
				:host .dialog {
					display: block;
					position: fixed;
					top: 50%;
					left: 50%;
					transform: translate(-50%, -50%);
					border-radius: var(--border-radius-dialog);
					background: var(--color-background);
					width: var(--width-dialog);
					max-width: var(--width-dialog-max);
					height: var(--height-dialog);
					min-height: var(--height-dialog-min);
					max-height: var(--height-dialog-max);
					padding: var(--padding-dialog);
					box-shadow: var(--box-shadow-dialog);
					box-sizing: border-box;
					overflow-y: auto;
					z-index: var(--z-index-dialog);
					transition: all var(--animation-duration-dialog) var(--animation-easing-dialog);
				}

				:host .dialog .content {
					display: flex;
					flex-direction: column;
					justify-content: flex-start;
					align-items: flex-start;
					gap: 5pt;
				}
				:host(:not([presented])) .dialog {
					transform: translate(-50%, calc(-50% + 50px));
					opacity: 0;
					pointer-events: none;
				}
			</style>
			<div class="overlay"></div>
			<div class="dialog">
				<q-title></q-title>
				<div class="content">
					<slot></slot>
				</div>
			</div>
		`;
		this.present = function () {
			this.setAttribute("presented", "");
		};
		this.dismiss = function () {
			this.removeAttribute("presented");
		};
	}
	setupElement() {
		this.shadowRoot.querySelector(".overlay").addEventListener("click", () => {
			this.dismiss();
		});
		this.shadowRoot.querySelector(".dialog").addEventListener("click", (e) => {
			if (e.target.tagName === "Q-DIALOG-BUTTON") {
				this.dismiss();
			}
		});
		if (this.getAttribute("title")) {
			this.shadowRoot.querySelector("q-title").textContent = this.getAttribute("title");
			if (this.getAttribute("icon")) {
				this.shadowRoot.querySelector("q-title").setAttribute("icon", this.getAttribute("icon"));
			}
		}
	}
	connectedCallback() {
		this.setupElement();
	}
	static get observedAttributes() {
		return [];
	}
	attributeChangedCallback(name, oldValue, newValue) {
		// Handle changes to attributes
		this.setupElement();
	}
}
customElements.define("q-dialog", QDialog);

class QStack extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: "open" });
		this.shadowRoot.innerHTML = `
			<style>
				:host {
					width: 100%;
					display: flex;
					align-items: center;
					justify-content: space-between;
					gap: 5px;
				}
				:host([direction="row"]) {
					flex-direction: row;
				}
				:host([direction="column"]) {
					flex-direction: column;
				}
			</style>
			<slot></slot>
		`;
	}
	buttons = [];
	setupElement() {}
	connectedCallback() {
		this.setupElement();
	}
	static get observedAttributes() {
		return [];
	}
	attributeChangedCallback(name, oldValue, newValue) {
		// Handle changes to attributes
		this.setupElement();
	}
}
customElements.define("q-stack", QStack);

class QTitleBar extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: "open" });
		this.shadowRoot.innerHTML = `
			<style>
				:host {
					display: block;
					padding: var(--padding-title-bar);
					color: var(--color-title);
					font-weight: var(--font-weight-title);
					font-size: var(--font-size-title);
					font-family: var(--font-family);
					cursor: pointer;
				}
				:host([disabled]) {
					cursor: default;
				}

				:host fa-i[icon] {
					margin-right: 2px;
				}
			</style>
			<fa-i></fa-i>
			<slot></slot>
		`;
	}
	setupElement() {
		if (this.getAttribute("icon")) {
			this.shadowRoot.querySelector("fa-i").setAttribute("icon", this.getAttribute("icon"));
		}
	}
	connectedCallback() {
		this.setupElement();
	}
	static get observedAttributes() {
		return [];
	}
	attributeChangedCallback(name, oldValue, newValue) {
		// Handle changes to attributes
		this.setupElement();
	}
}
customElements.define("q-title-bar", QTitleBar);

class QTitle extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: "open" });
		this.shadowRoot.innerHTML = `
            <style>
				:host {
					display: block;
					padding: var(--padding-title);
				}
				:host .title {
					display: flex;
					justify-content: flex-start;
					align-items: center;
				}
				:host fa-i[icon] {
					margin-right: 5px;
				}
                :host p {
					margin: 0;
                    color: var(--color-title);
                    font-weight: var(--font-weight-title);
                    font-size: var(--font-size-title);
                    font-family: var(--font-family);
                }
            </style>
			<div class="title">
				<fa-i size="var(--font-size-title)"></fa-i>
				<p><slot></slot></p>
			</div>
        `;
	}
	setupElement() {
		if (this.getAttribute("icon")) {
			this.shadowRoot.querySelector("fa-i").setAttribute("icon", this.getAttribute("icon"));
		}
	}
	connectedCallback() {
		this.setupElement();
	}
	static get observedAttributes() {
		return [];
	}
	attributeChangedCallback(name, oldValue, newValue) {
		// Handle changes to attributes
		this.setupElement();
	}
}
customElements.define("q-title", QTitle);

class QHeading extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: "open" });
		this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    padding: var(--padding-heading);
                    color: var(--color-heading);
                    font-weight: var(--font-weight-heading);
                    font-size: var(--font-size-heading);
                    font-family: var(--font-family);
                }
            </style>
            <slot></slot>
        `;
	}
	setupElement() {}
	connectedCallback() {
		this.setupElement();
	}
	static get observedAttributes() {
		return [];
	}
	attributeChangedCallback(name, oldValue, newValue) {
		// Handle changes to attributes
		this.setupElement();
	}
}
customElements.define("q-heading", QHeading);

class QSubheading extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: "open" });
		this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    padding: var(--padding-subheading);
                    color: var(--color-subheading);
                    font-weight: var(--font-weight-subheading);
                    font-size: var(--font-size-subheading);
                    font-family: var(--font-family);
                }
            </style>
            <slot></slot>
        `;
	}
	setupElement() {}
	connectedCallback() {
		this.setupElement();
	}
	static get observedAttributes() {
		return [];
	}
	attributeChangedCallback(name, oldValue, newValue) {
		// Handle changes to attributes
		this.setupElement();
	}
}
customElements.define("q-subheading", QSubheading);

class QText extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: "open" });
		this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    padding: var(--padding-text);
                    color: var(--color-text);
                    font-weight: var(--font-weight-text);
                    font-size: var(--font-size-text);
                    font-family: var(--font-family);
                }
            </style>
            <slot></slot>
        `;
	}
	setupElement() {}
	connectedCallback() {
		this.setupElement();
	}
	static get observedAttributes() {
		return [];
	}
	attributeChangedCallback(name, oldValue, newValue) {
		// Handle changes to attributes
		this.setupElement();
	}
}
customElements.define("q-text", QText);

class QLabel extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: "open" });
		this.shadowRoot.innerHTML = `
			<style>
				:host {
					display: block;
					padding: var(--padding-label);
					color: var(--color-label);
					font-weight: var(--font-weight-label);
					font-size: var(--font-size-label);
					font-family: var(--font-family);
				}
			</style>
			<slot></slot>
		`;
	}
	setupElement() {}
	connectedCallback() {
		this.setupElement();
	}
	static get observedAttributes() {
		return [];
	}
	attributeChangedCallback(name, oldValue, newValue) {
		// Handle changes to attributes
		this.setupElement();
	}
}
customElements.define("q-label", QLabel);

class QSpacer extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: "open" });
		this.shadowRoot.innerHTML = `
			<style>
				:host {
					flex-grow: 1;
				}
			</style>
		`;
	}
	setupElement() {}
	connectedCallback() {
		this.setupElement();
	}
	static get observedAttributes() {
		return [];
	}
	attributeChangedCallback(name, oldValue, newValue) {
		// Handle changes to attributes
		this.setupElement();
	}
}
customElements.define("q-spacer", QSpacer);

class QToggleGroup extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: "open" });
		this.shadowRoot.innerHTML = `
			<style>
				:host {
					width: 100%;
					display: flex;
					align-items: center;
					justify-content: flex-start;
					gap: 5px;
				}

				.container {
					margin-left: 5px;
				}
			</style>
			<slot name="leading"></slot>
			<div class="container">
				<slot></slot>
			</div>
		`;
	}
	buttons = [];
	setupElement() {
		requestAnimationFrame(() => {
			// Search second slot element for q-button elements and apply the rounded attribute
			const slot = this.shadowRoot.querySelectorAll("slot")[1];
			const buttons = slot.assignedElements().filter((el) => el.tagName === "Q-BUTTON");
			buttons.forEach((button, index) => {
				button.setAttribute("rounded", "left");
				this.buttons.push(button);
			});

			this.shadowRoot.addEventListener("click", (e) => {
				const target = e.target;
				if (target.tagName === "Q-BUTTON" && this.buttons.includes(target)) {
					if (this.getAttribute("mode") === "radio") {
						this.buttons.forEach((button) => {
							button.removeAttribute("selected");
						});
						target.setAttribute("selected", "");
					} else {
						if (target.hasAttribute("selected")) {
							target.removeAttribute("selected");
						} else {
							target.setAttribute("selected", "");
						}
					}
				}
			});
		});
	}
	connectedCallback() {
		this.setupElement();
	}
	static get observedAttributes() {
		return [];
	}
	attributeChangedCallback(name, oldValue, newValue) {
		// Handle changes to attributes
		this.setupElement();
	}
}
customElements.define("q-toggle-group", QToggleGroup);

class QButton extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: "open" });
		this.shadowRoot.innerHTML = `
            <style>
                :host {
					display: inline-flex;
					align-items: center;
					justify-content: center;
					height: var(--height-button);
					padding: var(--padding-button);
					margin: var(--margin-button);
                    border: 0;
                    border-radius: var(--border-radius-button);
                    background-color: var(--color-button-background);
                    color: var(--color-button-foreground);
                    font-size: var(--font-size-button);
                    font-family: var(--font-family);
					font-weight: var(--font-weight-button);
                    -webkit-user-select: none;
                    user-select: none;
                    cursor: pointer;
					vertical-align: top;
					transition: all var(--animation-duration-button) var(--animation-easing-button);
                }
				:host([rounded]) {
					border-radius: 20px;
				}
                :host([disabled]) {
                    opacity: 0.5;
                    cursor: not-allowed;
                    pointer-events: none;
                }
				:host(.selected) {
					background-color: var(--color-button-background-selected);
					color: var(--color-button-foreground-selected);
				}

				:host > fa-i[icon] {
					font-size: var(--font-size-button-icon);
					margin-right: 5px;
				}
            </style>
			<fa-i></fa-i>
            <slot></slot>
        `;
	}
	setupElement() {
		this.onclick = () => {
			if (this.getAttribute("action")) {
				eval(this.getAttribute("action"));
			}
		};
		if (this.getAttribute("type") === "primary") {
			this.classList.add("primary");
		}
		if (this.getAttribute("icon")) {
			this.shadowRoot.querySelector("fa-i").setAttribute("icon", this.getAttribute("icon"));
		}
		if (this.getAttribute("selected") !== null) {
			this.classList.add("selected");
		} else {
			this.classList.remove("selected");
		}
	}
	connectedCallback() {
		this.setupElement();
	}
	static get observedAttributes() {
		return ["type", "action", "icon", "selected"];
	}
	attributeChangedCallback(name, oldValue, newValue) {
		// Handle changes to attributes
		this.setupElement();
	}
}
customElements.define("q-button", QButton);

class QNavigationButton extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: "open" });
		this.shadowRoot.innerHTML = `
			<style>
				:host {
					display: inline-flex;
					align-items: center;
					justify-content: flex-start;
					height: var(--height-button);
					width: 100%;
					padding: var(--padding-button);
					margin: var(--margin-button);
					border: 0;
					border-radius: var(--border-radius-button);
					background-color: var(--color-button-background);
					color: var(--color-button-foreground);
					font-size: var(--font-size-button);
					font-family: var(--font-family);
					font-weight: var(--font-weight-button);
					-webkit-user-select: none;
					user-select: none;
					cursor: pointer;
					vertical-align: top;
					box-sizing: border-box;
					transition: background-color var(--animation-duration-button) var(--animation-easing-button);
				}
				:host([disabled]) {
					opacity: 0.5;
					cursor: not-allowed;
					pointer-events: none;
				}
				:host(:active) {
					background-color: var(--color-button-background-active);
				}

				:host > fa-i[icon] {
					font-size: var(--font-size-button-icon);
				}
				:host > fa-i[icon]:first-of-type {
					margin-right: 8px;
				}
				:host > fa-i[icon]:last-of-type {
					margin-left: auto;
				}
			</style>
			<fa-i></fa-i>
			<slot></slot>
			<fa-i icon="chevron-right"></fa-i>
		`;
	}
	setupElement() {
		this.onclick = () => {
			if (this.getAttribute("to")) {
				// If there are any presented sheets, dismiss them
				document.querySelectorAll("q-sheet").forEach((sheet) => {
					if (sheet.getAttribute("presented") !== null) {
						sheet.dismiss();
					}
				});

				// Navigate to the UI element with the ID specified in the "to" attribute
				navigationController.navigate(this.getAttribute("to"));
			}
		};
		if (this.getAttribute("icon")) {
			this.shadowRoot.querySelector("fa-i").setAttribute("icon", this.getAttribute("icon"));
		}
	}
	connectedCallback() {
		this.setupElement();
	}
	static get observedAttributes() {
		return ["icon", "to"];
	}
	attributeChangedCallback(name, oldValue, newValue) {
		// Handle changes to attributes
		this.setupElement();
	}
}
customElements.define("q-navigation-button", QNavigationButton);

class QDialogButton extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: "open" });
		this.shadowRoot.innerHTML = `
			<style>
				:host {
					display: inline-flex;
					align-items: center;
					justify-content: center;
					height: var(--height-button);
					padding: var(--padding-button-dialog);
					margin: var(--margin-button);
					border: 0;
					border-radius: var(--border-radius-button-dialog);
					background: var(--color-button-background);
					color: var(--color-button-foreground);
					font-size: var(--font-size-button);
					font-family: var(--font-family);
					font-weight: var(--font-weight-button);
					-webkit-user-select: none;
					user-select: none;
					cursor: pointer;
					vertical-align: top;
					flex-grow: 1;
					transition: all var(--animation-duration-button) var(--animation-easing-button);
				}
				@media (min-width: 500px) {
					:host {
						flex-grow: 0;
					}
				}
				:host([disabled]) {
					opacity: 0.5;
					cursor: not-allowed;
					pointer-events: none;
				}
				:host(:active) {
					background: var(--color-background);
					color: var(--color-foreground);
				}
				:host([type]:active) {
					opacity: 0.5;
				}

				:host([type="primary"]) {
					background: var(--color-button-background-primary);
					color: var(--color-button-foreground-primary);
				}

				:host([type="destructive"]) {
					background: var(--color-button-background-destructive);
					color: var(--color-button-foreground-destructive);
				}

				:host > fa-i[icon] {
					font-size: var(--font-size-button-icon);
					margin-right: 5px;
				}
			</style>
			<fa-i></fa-i>
			<slot></slot>
		`;
	}
	setupElement() {
		this.onclick = () => {
			if (this.getAttribute("action")) {
				eval(this.getAttribute("action"));
			}
		};
		if (this.getAttribute("icon")) {
			this.shadowRoot.querySelector("fa-i").setAttribute("icon", this.getAttribute("icon"));
		}
	}
	connectedCallback() {
		this.setupElement();
	}
	static get observedAttributes() {
		return ["type", "action", "icon", "selected"];
	}
	attributeChangedCallback(name, oldValue, newValue) {
		// Handle changes to attributes
		this.setupElement();
	}
}
customElements.define("q-dialog-button", QDialogButton);

class QDialogButtonGroup extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: "open" });
		this.shadowRoot.innerHTML = `
			<style>
				:host {
					width: 100%;
					display: flex;
					align-items: center;
					justify-content: flex-end;
					flex-wrap: wrap;
					gap: 8px;
					overflow: hidden;
				}
			</style>
			<slot></slot>
		`;
	}
	setupElement() {}
	connectedCallback() {
		this.setupElement();
	}
	static get observedAttributes() {
		return [];
	}
	attributeChangedCallback(name, oldValue, newValue) {
		// Handle changes to attributes
		this.setupElement();
	}
}
customElements.define("q-dialog-button-group", QDialogButtonGroup);
