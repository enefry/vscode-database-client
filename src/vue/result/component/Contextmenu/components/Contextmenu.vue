<template>
  <div></div>
</template>

<script>
import { createApp } from "vue";
import Submenu from "./Submenu";
import { getElementsByClassName } from "../util";
import { COMPONENT_NAME } from "../constant";
export default {
  props: {
    items: Array,
    position: Object,
    style: Object,
    customClass: String,
    onDestroy: Function
  },
  data() {
    return {
      mainMenuApp: null,
      mainMenuContainer: null,
      mouseListening: false
    };
  },
  mounted() {
    const container = document.createElement('div');
    document.body.appendChild(container);
    this.mainMenuContainer = container;

    const app = createApp(Submenu, {
      items: this.items,
      commonClass: {
        menu: this.$style.menu,
        menuItem: this.$style.menu_item,
        clickableMenuItem: this.$style.menu_item__clickable,
        unclickableMenuItem: this.$style.menu_item__unclickable
      },
      position: {
        x: this.position ? this.position.x : 0,
        y: this.position ? this.position.y : 0,
        width: 0,
        height: 0
      },
      minWidth: this.style ? this.style.minWidth : 150,
      zIndex: this.style ? this.style.zIndex : 2,
      customClass: this.customClass,
      onClose: () => this.destroySelf()
    });
    app.component(COMPONENT_NAME, Submenu);
    app.mount(container);
    this.mainMenuApp = app;
    this.addListener();
  },
  unmounted() {
    this.removeListener();
    if (this.mainMenuApp) {
      this.mainMenuApp.unmount();
      this.mainMenuApp = null;
    }
    if (this.mainMenuContainer && this.mainMenuContainer.parentNode) {
      this.mainMenuContainer.parentNode.removeChild(this.mainMenuContainer);
      this.mainMenuContainer = null;
    }
  },
  methods: {
    destroySelf() {
      if (this.onDestroy) this.onDestroy();
    },
    mouseClickListener(e) {
      let el = e.target;
      const menus = getElementsByClassName(this.$style.menu);
      const menuItems = getElementsByClassName(this.$style.menu_item);
      const unclickableMenuItems = getElementsByClassName(
        this.$style.menu_item__unclickable
      );
      while (
        !menus.find(m => m === el) &&
        !menuItems.find(m => m === el) &&
        el.parentElement
      ) {
        el = el.parentElement;
      }
      if (menuItems.find(m => m === el)) {
        if (e.button !== 0 || unclickableMenuItems.find(m => m === el)) {
          return;
        }
        this.destroySelf();
        return;
      }
      if (!menus.find(m => m === el)) {
        this.destroySelf();
      }
    },
    addListener() {
      if (!this.mouseListening) {
        document.addEventListener("click", this.mouseClickListener);
        this.mouseListening = true;
      }
    },
    removeListener() {
      if (this.mouseListening) {
        document.removeEventListener("click", this.mouseClickListener);
        this.mouseListening = false;
      }
    }
  }
};
</script>

<style module>
.menu,
.menu_item,
.menu_item__clickable,
.menu_item__unclickable {
  box-sizing: border-box;
}
</style>
