
import { createApp } from 'vue';
import Contextmenu from "./components/Contextmenu";
import Submenu from "./components/Submenu";
import { COMPONENT_NAME } from "./constant";

export { Submenu, COMPONENT_NAME };

let lastApp = null;
let lastContainer = null;

const ContextmenuProxy = function (options) {
  // Destroy previous instance
  ContextmenuProxy.destroy();

  const container = document.createElement('div');
  document.body.appendChild(container);

  const app = createApp(Contextmenu, {
    items: options.items,
    position: {
      x: options.x || (options.event ? options.event.clientX : 0),
      y: options.y || (options.event ? options.event.clientY : 0)
    },
    customClass: options.customClass,
    style: {
      minWidth: options.minWidth || 150,
      zIndex: options.zIndex || 2
    },
    onDestroy: () => {
      ContextmenuProxy.destroy();
    }
  });

  // Register Submenu component globally within this app
  app.component(COMPONENT_NAME, Submenu);
  app.mount(container);

  lastApp = app;
  lastContainer = container;
};

ContextmenuProxy.destroy = function () {
  if (lastApp) {
    lastApp.unmount();
    lastApp = null;
  }
  if (lastContainer && lastContainer.parentNode) {
    lastContainer.parentNode.removeChild(lastContainer);
    lastContainer = null;
  }
};

export default {
  install(app) {
    app.config.globalProperties.$contextmenu = ContextmenuProxy;
  }
}
